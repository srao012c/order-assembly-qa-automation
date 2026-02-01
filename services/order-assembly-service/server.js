const express = require('express');
const axios = require('axios');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Valid API keys with metadata
const VALID_API_KEYS = {
  'sk-test-valid-key-123456789': {
    name: 'Test Client',
    createdAt: new Date('2025-01-01'),
    expiresAt: null, // No expiration
  },
  'sk-test-limited-key-987654321': {
    name: 'Limited Client',
    createdAt: new Date('2024-01-01'),
    expiresAt: new Date('2026-02-28'),
  },
};

// Middleware
app.use(express.json());

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  console.log(`Authenticating request with API key: ${apiKey}`);

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'API key is required. Provide it in the X-API-Key header.',
    });
  }

  // Check if API key is valid
  const keyData = VALID_API_KEYS[apiKey];
  if (!keyData) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Invalid API key provided.',
    });
  }

  // Check if API key has expired
  if (keyData.expiresAt && new Date() > keyData.expiresAt) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'API key has expired.',
    });
  }

  // Store key info in request for logging
  req.apiKeyInfo = keyData;
  next();
};

// Configure AWS SDK for LocalStack
const sqs = new AWS.SQS({
  endpoint: process.env.SQS_ENDPOINT || 'http://localhost:4566',
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const QUEUE_URL = process.env.QUEUE_URL || 'http://localhost:4566/000000000000/assembled-orders';
const CARD_CATALOG_BASE_URL = process.env.CARD_CATALOG_URL || 'http://localhost:8080';

// Request validation schema
const validateOrderPayload = (payload) => {
  const errors = [];

  if (!payload.order_id || typeof payload.order_id !== 'string') {
    errors.push('order_id is required and must be a string');
  }

  if (!payload.customer_id || typeof payload.customer_id !== 'string') {
    errors.push('customer_id is required and must be a string');
  }

  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('items is required and must be a non-empty array');
  }

  if (payload.items && Array.isArray(payload.items)) {
    payload.items.forEach((item, index) => {
      if (!item.sku || typeof item.sku !== 'string') {
        errors.push(`items[${index}].sku is required and must be a string`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`items[${index}].quantity must be a number greater than 0`);
      }
    });
  }

  if (!payload.order_ts || typeof payload.order_ts !== 'string') {
    errors.push('order_ts is required and must be a valid ISO 8601 timestamp');
  } else {
    // Validate ISO 8601 format
    const date = new Date(payload.order_ts);
    if (isNaN(date.getTime())) {
      errors.push('order_ts must be a valid ISO 8601 timestamp');
    }
  }

  return errors;
};

// Enrich order with Card Catalog metadata
const enrichOrderWithMetadata = async (items) => {
  const enrichedItems = [];

  for (const item of items) {
    try {
      const response = await axios.get(`${CARD_CATALOG_BASE_URL}/catalog/sku/${item.sku}`, {
        timeout: 5000,
      });

      enrichedItems.push({
        sku: item.sku,
        quantity: item.quantity,
        metadata: response.data,
      });
    } catch (error) {
      console.error(`Error enriching SKU ${item.sku}:`, error.message);
      throw {
        status: 502,
        message: `Failed to enrich item with SKU ${item.sku}`,
        details: error.message,
      };
    }
  }

  return enrichedItems;
};

// Publish to SQS
const publishToSQS = async (order) => {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(order),
      MessageAttributes: {
        order_id: {
          StringValue: order.order_id,
          DataType: 'String',
        },
        customer_id: {
          StringValue: order.customer_id,
          DataType: 'String',
        },
      },
    };

    const result = await sqs.sendMessage(params).promise();
    console.log('Message sent to SQS:', result.MessageId);
    return result;
  } catch (error) {
    console.error('Error publishing to SQS:', error);
    throw {
      status: 503,
      message: 'Failed to publish order to queue',
      details: error.message,
    };
  }
};

/**
 * Health Check Endpoint (no auth required)
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'order-assembly-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * Assemble Order Endpoint
 * POST /orders/assemble
 * Requires: X-API-Key header with valid API key
 */
app.post('/orders/assemble', authenticateApiKey, async (req, res) => {
  try {
    // Step 1: Validate payload
    const validationErrors = validateOrderPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    const { order_id, customer_id, items, order_ts } = req.body;

    // Step 2: Enrich with Card Catalog metadata
    let enrichedItems;
    try {
      enrichedItems = await enrichOrderWithMetadata(items);
    } catch (error) {
      return res.status(error.status || 502).json({
        error: error.message,
        details: error.details,
      });
    }

    // Step 3: Create enriched order object
    const enrichedOrder = {
      order_id,
      customer_id,
      items: enrichedItems,
      order_ts,
      assembled_ts: new Date().toISOString(),
      assembly_id: uuidv4(),
    };

    // Step 4: Publish to SQS
    try {
      const sqsResult = await publishToSQS(enrichedOrder);
      enrichedOrder.sqs_message_id = sqsResult.MessageId;
    } catch (error) {
      return res.status(error.status || 503).json({
        error: error.message,
        details: error.details,
      });
    }

    // Step 5: Return success response
    res.status(200).json({
      success: true,
      order_id,
      assembly_id: enrichedOrder.assembly_id,
      message: 'Order assembled and published successfully',
      sqs_message_id: enrichedOrder.sqs_message_id,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Order Assembly Service listening on port ${PORT}`);
  console.log(`Card Catalog Service URL: ${CARD_CATALOG_BASE_URL}`);
  console.log(`SQS Queue URL: ${QUEUE_URL}`);
});
