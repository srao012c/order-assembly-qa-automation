/**
 * Assertion Helper Utilities
 * Provides reusable assertion functions for API response validation
 */

export const assertionHelper = {
  /**
   * Validate HTTP status code
   * @param {number} response - Response object
   * @param {number} expectedStatus - Expected status code
   */
  validateStatus(response, expectedStatus) {
    expect(response.status).to.equal(expectedStatus);
  },

  /**
   * Validate response body contains expected properties
   * @param {object} response - Response object
   * @param {array} properties - Array of property names
   */
  validateProperties(response, properties) {
    properties.forEach((prop) => {
      expect(response.body).to.have.property(prop);
    });
  },

  /**
   * Validate response body structure matches expected structure
   * @param {object} response - Response object
   * @param {object} structure - Expected structure object
   */
  validateStructure(response, structure) {
    expect(response.body).to.include.all.keys(Object.keys(structure));
  },

  /**
   * Validate response body equals expected value
   * @param {object} response - Response object
   * @param {object} expectedBody - Expected response body
   */
  validateBody(response, expectedBody) {
    expect(response.body).to.deep.equal(expectedBody);
  },

  /**
   * Validate response header exists and has expected value
   * @param {object} response - Response object
   * @param {string} headerName - Header name
   * @param {string} expectedValue - Expected header value
   */
  validateHeader(response, headerName, expectedValue) {
    expect(response.headers[headerName.toLowerCase()]).to.equal(expectedValue);
  },

  /**
   * Validate response body property equals expected value
   * @param {object} response - Response object
   * @param {string} propertyPath - Property path (dot notation)
   * @param {any} expectedValue - Expected value
   */
  validateProperty(response, propertyPath, expectedValue) {
    const properties = propertyPath.split('.');
    let value = response.body;
    
    for (const prop of properties) {
      value = value[prop];
    }
    
    expect(value).to.equal(expectedValue);
  },
};
