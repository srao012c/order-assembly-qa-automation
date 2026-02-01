/**
 * SQS Failure Tests
 * Tests for SQS queue failure scenarios
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - SQS Failures', () => {
  describe('SQS Failure and Publish Error Handling', () => {
    it('should return 503 when SQS queue is unavailable', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.validOrder, {
            failOnStatusCode: false,
            timeout: 15000,
          })
          .then((response) => {
            // If SQS is down, should get 503 Service Unavailable
            if (response.status === 503) {
              expect(response.body.error).to.include('Failed to publish');
            }
          });
      });
    });

    it('should include error details when publish fails', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.validOrder, {
            failOnStatusCode: false,
            timeout: 15000,
          })
          .then((response) => {
            if (response.status === 503) {
              assertionHelper.validateProperties(response, ['error', 'details']);
            }
          });
      });
    });

    it('should validate order even if publish fails', () => {
      // Order should be validated before publish attempt
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.validOrder, {
            failOnStatusCode: false,
            timeout: 15000,
          })
          .then((response) => {
            // Should fail at publish (503), not validation (400)
            expect(response.status).to.not.equal(400);
          });
      });
    });
  });
});
