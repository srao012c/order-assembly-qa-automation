/**
 * API Helper Utilities
 * Provides reusable functions for making API requests
 */

// Default API key for requests (can be overridden per request)
let defaultApiKey = 'sk-test-valid-key-123456789';

export const apiHelper = {
  /**
   * Set the default API key for all requests
   * @param {string} key - API key to use
   */
  setDefaultApiKey(key) {
    defaultApiKey = key;
  },

  /**
   * Reset to valid default API key
   */
  resetDefaultApiKey() {
    defaultApiKey = 'sk-test-valid-key-123456789';
  },

  /**
   * Make a GET request to the specified endpoint
   * @param {string} endpoint - API endpoint path
   * @param {object} options - Cypress request options
   * @returns {Cypress.Chainable}
   */
  get(endpoint, options = {}) {
    const headers = options.headers || {};
    return cy.request({
      method: 'GET',
      url: endpoint,
      headers: {
        'x-api-key': defaultApiKey,
        ...headers,
      },
      ...options,
    });
  },

  /**
   * Make a POST request to the specified endpoint
   * @param {string} endpoint - API endpoint path
   * @param {object} payload - Request body
   * @param {object} options - Cypress request options
   * @returns {Cypress.Chainable}
   */
  post(endpoint, payload, options = {}) {
    const headers = options.headers || {};
    return cy.request({
      method: 'POST',
      url: endpoint,
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': defaultApiKey,
        ...headers,
      },
      ...options,
    });
  },

  /**
   * Make a PUT request to the specified endpoint
   * @param {string} endpoint - API endpoint path
   * @param {object} payload - Request body
   * @param {object} options - Cypress request options
   * @returns {Cypress.Chainable}
   */
  put(endpoint, payload, options = {}) {
    const headers = options.headers || {};
    return cy.request({
      method: 'PUT',
      url: endpoint,
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': defaultApiKey,
        ...headers,
      },
      ...options,
    });
  },

  /**
   * Make a DELETE request to the specified endpoint
   * @param {string} endpoint - API endpoint path
   * @param {object} options - Cypress request options
   * @returns {Cypress.Chainable}
   */
  delete(endpoint, options = {}) {
    const headers = options.headers || {};
    return cy.request({
      method: 'DELETE',
      url: endpoint,
      headers: {
        'x-api-key': defaultApiKey,
        ...headers,
      },
      ...options,
    });
  },
};
