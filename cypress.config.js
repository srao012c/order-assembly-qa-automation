const { defineConfig } = require('cypress');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    requestTimeout: 10000,
    responseTimeout: 10000,
    defaultCommandTimeout: 5000,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      reportFilename: 'mochawesome-[hash].json',
      overwrite: false,
      html: false,
      json: true,
      inlineAssets: true,
      saveJson: true,
    },
    env: {
      SQS_ENDPOINT: process.env.SQS_ENDPOINT || 'http://localhost:4566',
      CARD_CATALOG_URL: process.env.CARD_CATALOG_URL || 'http://localhost:8080',
    },
    setupNodeEvents(on, config) {
      // Task to stop the WireMock catalog service
      on('task', {
        stopCatalogService() {
          console.log('⏹️  Stopping WireMock catalog service...');
          return execAsync('docker compose stop wiremock').then(() => {
            console.log('✅ WireMock catalog service stopped');
            return null;
          }).catch((error) => {
            console.error('❌ Failed to stop WireMock:', error.message);
            throw error;
          });
        },

        // Task to start the WireMock catalog service
        startCatalogService() {
          console.log('🚀 Starting WireMock catalog service...');
          return execAsync('docker compose start wiremock').then(() => {
            console.log('✅ WireMock catalog service started');
            // Wait for service to be ready
            return new Promise((resolve) => {
              setTimeout(() => resolve(null), 2000);
            });
          }).catch((error) => {
            console.error('❌ Failed to start WireMock:', error.message);
            throw error;
          });
        },
      });

      return config;
    },
  },
});
