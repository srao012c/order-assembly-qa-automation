/**
 * Data-Driven Tests
 * Tests for data-driven testing scenarios
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - Data-Driven Tests', () => {
  describe('Data-Driven Tests', () => {
    it('should process multiple valid orders successfully', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        const orders = [fixture.validOrder, fixture.validOrderAlt];

        orders.forEach((order) => {
          apiHelper.post('/orders/assemble', order).then((response) => {
            assertionHelper.validateStatus(response, 200);
            assertionHelper.validateProperty(response, 'order_id', order.order_id);
            assertionHelper.validateProperty(response, 'success', true);
          });
        });
      });
    });
  });
});
