/**
 * Partial Service Failure Tests
 * Tests for handling partial service failures
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - Partial Service Failures', () => {
  describe('Partial Service Failures', () => {
    it('should validate payload even if enrichment service has issues', () => {
      // Invalid payload should fail validation before enrichment attempt
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.missingOrderId, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should handle partial SKU metadata enrichment gracefully', () => {
      // Order with mix of valid and invalid SKUs
      cy.fixture('order-payloads.json').then((fixture) => {
        const payload = {
          ...fixture.validOrder,
          items: [
            { sku: 'SKU100', quantity: 1 }, // Valid
            { sku: 'INVALID_SKU', quantity: 1 }, // Invalid
          ],
        };

        apiHelper
          .post('/orders/assemble', payload, {
            failOnStatusCode: false,
          })
          .then((response) => {
            // Should fail enrichment due to invalid SKU
            assertionHelper.validateStatus(response, 502);
          });
      });
    });

    it('should handle simultaneous validation and enrichment failures', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        const payload = {
          order_id: '', // Validation failure
          customer_id: 'C900',
          items: [{ sku: 'INVALID_SKU', quantity: 1 }], // Enrichment failure
          order_ts: '2025-01-31T10:12:33Z',
        };

        apiHelper
          .post('/orders/assemble', payload, {
            failOnStatusCode: false,
          })
          .then((response) => {
            // Validation should fail first
            assertionHelper.validateStatus(response, 400);
          });
      });
    });
  });
});
