/**
 * Input Validation Tests
 * Tests for payload validation and error handling
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - Input Validation', () => {
  describe('Input Validation - Invalid Payloads', () => {
    it('should return 400 for missing order_id', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.missingOrderId, { failOnStatusCode: false })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for missing customer_id', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.missingCustomerId, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for empty items array', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.emptyItems, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for missing items', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.missingItems, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for invalid item quantity (zero)', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.zeroQuantity, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for invalid item quantity (negative)', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.negativeQuantity, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for missing SKU in item', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.missingSku, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for invalid timestamp format', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.invalidTimestamp, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return 400 for missing timestamp', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.missingTimestamp, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateStatus(response, 400);
          });
      });
    });

    it('should return error object with details for validation failure', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.missingOrderId, {
            failOnStatusCode: false,
          })
          .then((response) => {
            assertionHelper.validateProperties(response, ['error', 'details']);
            expect(response.body.details).to.be.an('array');
            expect(response.body.details.length).to.be.greaterThan(0);
          });
      });
    });

    it('should reject malformed JSON payloads', () => {
      cy.request({
        method: 'POST',
        url: '/orders/assemble',
        body: 'invalid json {',
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((response) => {
        expect([400, 500]).to.include(response.status);
      });
    });

    it('should validate order_id is not empty string', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        const payload = {
          ...fixture.validOrder,
          order_id: '',
        };
        apiHelper.post('/orders/assemble', payload, { failOnStatusCode: false }).then((response) => {
          assertionHelper.validateStatus(response, 400);
        });
      });
    });

    it('should validate customer_id is not empty string', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        const payload = {
          ...fixture.validOrder,
          customer_id: '',
        };
        apiHelper.post('/orders/assemble', payload, { failOnStatusCode: false }).then((response) => {
          assertionHelper.validateStatus(response, 400);
        });
      });
    });
  });
});
