/**
 * SKU Enrichment Tests
 * Tests for SKU metadata enrichment and validation
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - SKU Enrichment', () => {
  describe('SKU Enrichment Validation', () => {
    it('should enrich order with valid SKU metadata', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          assertionHelper.validateStatus(response, 200);
          assertionHelper.validateProperty(response, 'success', true);
        });
      });
    });

    it('should return 502 for invalid SKU during enrichment', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.invalidSkuOrder, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 502);
            assertionHelper.validateProperties(response, ['error', 'details']);
          });
      });
    });
  });
});
