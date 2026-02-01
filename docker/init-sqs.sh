#!/bin/bash

echo "Creating SQS queue..."

# Wait for LocalStack to be ready
sleep 5

# Create the SQS queue
aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name assembled-orders

echo "SQS queue created successfully!"
