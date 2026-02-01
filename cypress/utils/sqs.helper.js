/**
 * SQS Helper Utilities
 * Provides methods to interact with LocalStack SQS for message validation
 * 
 * Usage:
 * import { sqsHelper } from './sqs.helper.js';
 * sqsHelper.receiveMessage('queue-name').then(message => { ... });
 */

const SQS_ENDPOINT = 'http://localhost:4566';
const QUEUE_NAME = 'assembled-orders';
const AWS_REGION = 'us-east-1';
const AWS_ACCESS_KEY = 'testing';
const AWS_SECRET_KEY = 'testing';

// AWS SDK v3 imports - these would need to be installed via npm
// For now, we'll use direct HTTP calls to LocalStack

export const sqsHelper = {
  /**
   * Get queue URL from LocalStack
   * @returns {Promise<string>} Queue URL
   */
  getQueueUrl: (queueName = QUEUE_NAME) => {
    return cy
      .request({
        method: 'POST',
        url: SQS_ENDPOINT,
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AmazonSQS.GetQueueUrl',
          'Authorization': `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY}/20250131/${AWS_REGION}/sqs/aws4_request`,
        },
        body: {
          QueueName: queueName,
        },
        failOnStatusCode: false,
      })
      .then((response) => {
        if (response.status === 200) {
          return response.body.QueueUrl;
        }
        throw new Error(`Failed to get queue URL: ${response.status}`);
      });
  },

  /**
   * Receive messages from SQS queue
   * @param {string} queueName - Name of the queue
   * @param {number} maxMessages - Maximum messages to receive (1-10)
   * @returns {Promise<Array>} Array of messages
   */
  receiveMessage: (queueName = QUEUE_NAME, maxMessages = 1) => {
    return sqsHelper.getQueueUrl(queueName).then((queueUrl) => {
      return cy
        .request({
          method: 'POST',
          url: SQS_ENDPOINT,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: {
            Action: 'ReceiveMessage',
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxMessages,
            Version: '2012-11-05',
          },
          failOnStatusCode: false,
        })
        .then((response) => {
          if (response.status === 200 && response.body.ReceiveMessageResponse) {
            const messages = response.body.ReceiveMessageResponse.ReceiveMessageResult.Message || [];
            return Array.isArray(messages) ? messages : [messages];
          }
          return [];
        });
    });
  },

  /**
   * Receive message and parse body as JSON
   * @param {string} queueName - Name of the queue
   * @returns {Promise<Object>} Parsed message body
   */
  receiveAndParseMessage: (queueName = QUEUE_NAME) => {
    return sqsHelper.receiveMessage(queueName, 1).then((messages) => {
      if (messages.length === 0) {
        throw new Error('No messages in queue');
      }
      const message = messages[0];
      return JSON.parse(message.Body);
    });
  },

  /**
   * Delete message from queue
   * @param {string} queueName - Name of the queue
   * @param {string} receiptHandle - Receipt handle from message
   * @returns {Promise<boolean>} Success status
   */
  deleteMessage: (queueName = QUEUE_NAME, receiptHandle) => {
    return sqsHelper.getQueueUrl(queueName).then((queueUrl) => {
      return cy
        .request({
          method: 'POST',
          url: SQS_ENDPOINT,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: {
            Action: 'DeleteMessage',
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
            Version: '2012-11-05',
          },
          failOnStatusCode: false,
        })
        .then((response) => {
          return response.status === 200;
        });
    });
  },

  /**
   * Purge all messages from queue
   * @param {string} queueName - Name of the queue
   * @returns {Promise<boolean>} Success status
   */
  purgeQueue: (queueName = QUEUE_NAME) => {
    return sqsHelper.getQueueUrl(queueName).then((queueUrl) => {
      return cy
        .request({
          method: 'POST',
          url: SQS_ENDPOINT,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: {
            Action: 'PurgeQueue',
            QueueUrl: queueUrl,
            Version: '2012-11-05',
          },
          failOnStatusCode: false,
        })
        .then((response) => {
          return response.status === 200;
        });
    });
  },

  /**
   * Get queue attributes (message count, etc.)
   * @param {string} queueName - Name of the queue
   * @returns {Promise<Object>} Queue attributes
   */
  getQueueAttributes: (queueName = QUEUE_NAME) => {
    return sqsHelper.getQueueUrl(queueName).then((queueUrl) => {
      return cy
        .request({
          method: 'POST',
          url: SQS_ENDPOINT,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: {
            Action: 'GetQueueAttributes',
            QueueUrl: queueUrl,
            AttributeNames: ['All'],
            Version: '2012-11-05',
          },
          failOnStatusCode: false,
        })
        .then((response) => {
          if (response.status === 200 && response.body.GetQueueAttributesResponse) {
            return response.body.GetQueueAttributesResponse.GetQueueAttributesResult.Attributes;
          }
          return {};
        });
    });
  },

  /**
   * Wait for message in queue with timeout
   * @param {string} queueName - Name of the queue
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} pollInterval - Poll interval in milliseconds
   * @returns {Promise<Object>} Message object
   */
  waitForMessage: (queueName = QUEUE_NAME, timeout = 10000, pollInterval = 500) => {
    const startTime = Date.now();

    const pollQueue = () => {
      return sqsHelper.receiveMessage(queueName, 1).then((messages) => {
        if (messages.length > 0) {
          return messages[0];
        }

        if (Date.now() - startTime > timeout) {
          throw new Error(`Timeout waiting for message in queue: ${queueName}`);
        }

        // Wait before polling again
        return new Cypress.Promise((resolve) => {
          setTimeout(() => {
            resolve(pollQueue());
          }, pollInterval);
        });
      });
    };

    return pollQueue();
  },

  /**
   * Validate message structure
   * @param {Object} message - Message object from SQS
   * @param {Array<string>} requiredFields - Required fields in message body
   * @returns {Promise<boolean>} Validation result
   */
  validateMessageStructure: (message, requiredFields = []) => {
    return new Cypress.Promise((resolve, reject) => {
      try {
        expect(message).to.have.property('Body');
        expect(message).to.have.property('MessageId');
        expect(message).to.have.property('ReceiptHandle');

        const body = JSON.parse(message.Body);
        expect(body).to.be.an('object');

        if (requiredFields.length > 0) {
          requiredFields.forEach((field) => {
            expect(body).to.have.property(field);
          });
        }

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Validate order message content
   * @param {Object} message - Message from SQS
   * @param {Object} expectedOrder - Expected order data
   * @returns {Promise<boolean>} Validation result
   */
  validateOrderMessage: (message, expectedOrder = {}) => {
    return new Cypress.Promise((resolve, reject) => {
      try {
        const body = JSON.parse(message.Body);

        // Validate core order fields
        expect(body).to.have.property('order_id');
        expect(body).to.have.property('customer_id');
        expect(body).to.have.property('items');
        expect(body).to.have.property('order_ts');
        expect(body).to.have.property('assembly_id');

        // Validate against expected order if provided
        if (Object.keys(expectedOrder).length > 0) {
          if (expectedOrder.order_id) {
            expect(body.order_id).to.equal(expectedOrder.order_id);
          }
          if (expectedOrder.customer_id) {
            expect(body.customer_id).to.equal(expectedOrder.customer_id);
          }
          if (expectedOrder.items) {
            expect(body.items).to.be.an('array');
          }
        }

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Validate enriched SKU data in message
   * @param {Object} message - Message from SQS
   * @param {Array<string>} expectedSkus - Expected SKUs in message
   * @returns {Promise<boolean>} Validation result
   */
  validateEnrichedData: (message, expectedSkus = []) => {
    return new Cypress.Promise((resolve, reject) => {
      try {
        const body = JSON.parse(message.Body);
        expect(body).to.have.property('enriched_items');

        const enrichedItems = body.enriched_items || [];
        expect(enrichedItems).to.be.an('array');

        if (expectedSkus.length > 0) {
          expectedSkus.forEach((sku) => {
            const foundSku = enrichedItems.some((item) => item.sku === sku);
            expect(foundSku).to.be.true;
          });
        }

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },
};
