/**
 * Dependency Failure Tests
 * Tests for catalog service outage scenarios
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - Dependency Failures', () => {
  describe('Dependency Failure Scenarios - Catalog Service Outage', () => {
    beforeEach(() => {
      // Stop the WireMock catalog service before each test in this suite
      cy.task('stopCatalogService');
      // Give the service time to fully stop
      cy.wait(1000);
    });

    afterEach(() => {
      // Restart the WireMock catalog service after each test
      cy.task('startCatalogService');
      // Wait for service to be healthy
      cy.wait(2000);
    });

    it('should return 502 when catalog service is unavailable', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        // Use valid order - catalog service is actually stopped
        apiHelper
          .post('/orders/assemble', fixture.validOrder, {
            failOnStatusCode: false,
            timeout: 15000,
          })
          .then((response) => {
            // When catalog service is unavailable, OAS returns 502
            assertionHelper.validateStatus(response, 502);
          });
      });
    });

    it('should return appropriate error message for enrichment failure', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        apiHelper
          .post('/orders/assemble', fixture.validOrder, {
            failOnStatusCode: false,
          })
          .then((response) => {
            expect(response.body.error).to.exist;
            expect(response.body.error).to.include('Failed to enrich');
          });
      });
    });

    it('should handle catalog service timeout gracefully', () => {
      cy.fixture('order-payloads.json').then((fixture) => {
        // Use valid order - catalog service is actually stopped
        apiHelper
          .post('/orders/assemble', fixture.validOrder, {
            failOnStatusCode: false,
            timeout: 15000,
          })
          .then((response) => {
            // Should return 502 error when catalog service fails
            assertionHelper.validateStatus(response, 502);
            expect(response.body.error).to.exist;
          });
      });
    });
  });
});
