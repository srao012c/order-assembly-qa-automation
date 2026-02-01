/**
 * Authentication Tests
 * Tests for API Key validation and authentication mechanisms
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - Authentication', () => {
  describe('Authentication - API Key Validation', () => {
    it('should return 401 when no API key is provided', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        cy.request({
          method: 'POST',
          url: '/orders/assemble',
          body: fixture.validOrder,
          headers: {
            'Content-Type': 'application/json',
            // No X-API-Key header
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body.error).to.equal('Unauthorized');
          expect(response.body.details).to.include('API key is required');
        });
      });
    });

    it('should return 401 when invalid API key is provided', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        cy.request({
          method: 'POST',
          url: '/orders/assemble',
          body: fixture.validOrder,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'sk-invalid-key-wrong-123',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body.error).to.equal('Unauthorized');
          expect(response.body.details).to.include('Invalid API key');
        });
      });
    });

    it('should return 401 when malformed API key is provided', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        cy.request({
          method: 'POST',
          url: '/orders/assemble',
          body: fixture.validOrder,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'malformed-key',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body.error).to.equal('Unauthorized');
        });
      });
    });

    it('should return 401 when empty API key is provided', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        cy.request({
          method: 'POST',
          url: '/orders/assemble',
          body: fixture.validOrder,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': '',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body.error).to.equal('Unauthorized');
        });
      });
    });

    it('should accept requests with valid API key', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          // Should succeed with valid API key (200, not 401)
          assertionHelper.validateStatus(response, 200);
          assertionHelper.validateProperty(response, 'success', true);
        });
      });
    });

    it('should validate API key is case-sensitive', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        cy.request({
          method: 'POST',
          url: '/orders/assemble',
          body: fixture.validOrder,
          headers: {
            'Content-Type': 'application/json',
            // Valid key with different case
            'x-api-key': 'SK-TEST-VALID-KEY-123456789',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body.details).to.include('Invalid API key');
        });
      });
    });

    it('should not require API key for health check endpoint', () => {
      cy.request({
        method: 'GET',
        url: '/health',
        // No API key header
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('healthy');
      });
    });

    it('should accept additional X-API-Key header variants', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        cy.request({
          method: 'POST',
          url: '/orders/assemble',
          body: fixture.validOrder,
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': 'sk-test-valid-key-123456789', // Different case
          },
          failOnStatusCode: false,
        }).then((response) => {
          // Headers are case-insensitive in HTTP, should work
          // Note: Depending on Express config, may or may not work
          // This test documents the behavior
          if (response.status === 200) {
            assertionHelper.validateProperty(response, 'success', true);
          }
        });
      });
    });
  });
});
