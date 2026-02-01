#!/bin/bash

# Cleanup script for OAS Cypress
# Stops and removes all Docker containers and services

echo "Stopping and removing containers..."
docker compose down -v

echo "✓ Cleanup complete"
