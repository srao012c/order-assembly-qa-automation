// Global test setup and configuration
// This file is loaded before each test suite

// Suppress console errors for cleaner test output (optional)
const app = window.top;

if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');

  app.document.head.appendChild(style);
}

// Global test configuration
beforeEach(() => {
  cy.log('Starting new test');
});

afterEach(() => {
  cy.log('Test completed');
});
