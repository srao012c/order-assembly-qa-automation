/**
 * Happy Path Tests
 * Tests for successful order assembly scenarios
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - Happy Path', () => {
  describe('Happy Path - Valid Order', () => {
    it('should assemble valid order with status 200', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          assertionHelper.validateStatus(response, 200);
        });
      });
    });

    it('should return success response with required fields', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          assertionHelper.validateProperties(response, [
            'success',
            'order_id',
            'assembly_id',
            'message',
            'sqs_message_id',
          ]);
        });
      });
    });

    it('should return true for success field', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          assertionHelper.validateProperty(response, 'success', true);
        });
      });
    });

    it('should return matching order_id in response', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        const expectedOrderId = fixture.validOrder.order_id;
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          assertionHelper.validateProperty(response, 'order_id', expectedOrderId);
        });
      });
    });

    it('should generate unique assembly_id', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          const assemblyId = response.body.assembly_id;
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          expect(assemblyId).to.match(uuidPattern);
        });
      });
    });

    it('should return SQS message ID', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper.post('/orders/assemble', fixture.validOrder).then((response) => {
          expect(response.body.sqs_message_id).to.exist;
          expect(response.body.sqs_message_id).to.not.be.empty;
        });
      });
    });
  });
});
