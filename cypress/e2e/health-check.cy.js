/**
 * Health Check Tests
 * Tests for GET /health endpoint
 */

import { apiHelper } from '../utils/api.helper.js';
import { assertionHelper } from '../utils/assertion.helper.js';

describe('Order Assembly Service (OAS) - Health Check', () => {
  describe('Health Check - GET /health', () => {
    it('should return healthy status with 200', () => {
      apiHelper.get('/health').then((response) => {
        assertionHelper.validateStatus(response, 200);
      });
    });

    it('should return service name and status in health response', () => {
      apiHelper.get('/health').then((response) => {
        assertionHelper.validateProperties(response, [
          'status',
          'service',
          'timestamp',
          'version',
        ]);
      });
    });

    it('should have status property equal to "healthy"', () => {
      apiHelper.get('/health').then((response) => {
        assertionHelper.validateProperty(response, 'status', 'healthy');
      });
    });

    it('should have correct service name in health response', () => {
      apiHelper.get('/health').then((response) => {
        assertionHelper.validateProperty(response, 'service', 'order-assembly-service');
      });
    });

    it('should return valid timestamp in ISO 8601 format', () => {
      apiHelper.get('/health').then((response) => {
        const timestamp = response.body.timestamp;
        const date = new Date(timestamp);
        expect(isNaN(date.getTime())).to.be.false;
      });
    });

    it('should have correct health response structure', () => {
      cy.fixture('health-check.json').then((fixture) => {
        apiHelper.get('/health').then((response) => {
          expect(response.body).to.have.property('status', 'healthy');
          expect(response.body).to.have.property('service', 'order-assembly-service');
          expect(response.body).to.have.property('version');
          expect(response.body).to.have.property('timestamp');
        });
      });
    });
  });
});
