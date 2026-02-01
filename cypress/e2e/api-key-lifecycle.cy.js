/**
 * API Key Lifecycle Tests
 * Tests for API key expiration and lifecycle management
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - API Key Lifecycle', () => {
  describe('API Key Expiration and Lifecycle', () => {
    it('should use valid API key for authenticated requests', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        // Use valid non-expired key
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          assertionHelper.validateStatus(response, 200);
          assertionHelper.validateProperty(response, 'success', true);
        });
      });
    });

    it('should allow requests with non-expired limited API key', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.setDefaultApiKey('sk-test-limited-key-987654321');
        
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          assertionHelper.validateStatus(response, 200);
          assertionHelper.validateProperty(response, 'success', true);
        });

        // Reset to default key for other tests
        apiHelper.resetDefaultApiKey();
      });
    });

    it('should handle multiple API keys correctly', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        // Test with first key
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response1) => {
          assertionHelper.validateStatus(response1, 200);

          // Switch to different key
          apiHelper.setDefaultApiKey('sk-test-limited-key-987654321');
          apiHelper.post('/orders/assemble', fixture.validOrder).then((response2) => {
            assertionHelper.validateStatus(response2, 200);
          });

          // Reset
          apiHelper.resetDefaultApiKey();
        });
      });
    });

    it('should reject requests when switching to invalid key', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.setDefaultApiKey('sk-invalid-expired-key');
        
        cy.request({
          method: 'POST',
          url: '/orders/assemble',
          body: fixture.validOrder,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'sk-invalid-expired-key',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
        });

        // Reset
        apiHelper.resetDefaultApiKey();
      });
    });
  });
});
