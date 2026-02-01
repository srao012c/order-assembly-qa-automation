# Order Assembly Service (OAS) - Cypress Test Suite

Comprehensive end-to-end test automation suite for the Order Assembly Service. This project provides a complete local testing environment with service mocking, API key authentication, event queue simulation, and continuous integration via GitHub Actions.

## 📋 Project Overview

The Order Assembly Service is a Node.js/Express API that:
- Validates incoming order payloads
- Enriches orders with SKU metadata from a catalog service
- Publishes assembled orders to an SQS queue
- Requires API key authentication for protected endpoints

This test suite validates all aspects of this service with **59 comprehensive tests** organized across **12 focused test files**.

---

## 🏗️ Architecture

### Test Environment Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Cypress Test Suite (59 tests)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│     OAS     │  │  WireMock   │  │ LocalStack  │
│ :3000       │  │  :8080      │  │   :4566     │
│ Express API │  │  Card Cat   │  │    SQS      │
│ + Auth      │  │  Service    │  │   Queue     │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Core Services

1. **Order Assembly Service** (Node.js/Express)
   - REST API for order processing
   - API key authentication
   - Order validation and enrichment
   - SQS publishing

2. **WireMock** (Card Catalog Service Mock)
   - SKU metadata lookup
   - API stub responses
   - Configurable for outage testing

3. **LocalStack** (AWS SQS Mock)
   - Local SQS queue emulation
   - Message queue operations
   - AWS SDK compatible

4. **Cypress** (Test Automation)
   - API testing framework
   - End-to-end test execution
   - Comprehensive assertions
   - CI/CD integration

---

## 📁 Project Structure

```
OAS_Cypress/
├── .github/
│   └── workflows/                      # GitHub Actions CI/CD
│       ├── test.yml                    # Main workflow (push, PR, manual)
│       └── scheduled-test.yml          # Daily scheduled tests
│
├── cypress/
│   ├── e2e/                            # Test files (12 files, 59 tests)
│   │   ├── health-check.cy.js          # 6 tests - Service health
│   │   ├── authentication.cy.js        # 8 tests - API key auth
│   │   ├── api-key-lifecycle.cy.js     # 4 tests - Key expiration
│   │   ├── happy-path.cy.js            # 6 tests - Successful orders
│   │   ├── input-validation.cy.js      # 14 tests - Payload validation
│   │   ├── sku-enrichment.cy.js        # 2 tests - Metadata enrichment
│   │   ├── dependency-failures.cy.js   # 3 tests - Service outage
│   │   ├── sqs-failures.cy.js          # 3 tests - Queue failures
│   │   ├── retry-idempotency.cy.js     # 3 tests - Retry behavior
│   │   ├── partial-failures.cy.js      # 3 tests - Multiple failures
│   │   ├── data-driven.cy.js           # 1 test  - Multiple orders
│   │   └── sqs-message-validation.cy.js # 6 tests - Message content
│   │
│   ├── fixtures/                       # Test data
│   │   ├── order-payloads.json         # Order test data (17 variations)
│   │   └── health-check.json
│   │
│   ├── support/
│   │   └── e2e.js                      # Cypress configuration
│   │
│   └── utils/                          # Reusable helpers
│       ├── api.helper.js               # API request functions
│       └── assertion.helper.js         # Response assertions
│
├── services/
│   └── order-assembly-service/
│       ├── server.js                   # Express server (auth + validation)
│       ├── package.json
│       └── Dockerfile
│
├── docker/
│   ├── wiremock/
│   │   └── stubs/                      # Mock API responses
│   │       ├── mappings/
│   │       │   ├── sku100.json
│   │       │   ├── sku200.json
│   │       │   └── invalid_sku.json
│   │       └── __files/
│   │
│   └── init-sqs.sh                     # Automated queue initialization
│
├── scripts/
│   ├── setup.sh                        # Start all services
│   └── cleanup.sh                      # Stop all services
│
├── cypress.config.js                   # Cypress + Docker task config
├── docker-compose.yml                  # Service orchestration + sqs-init
├── package.json
└── README.md (this file)
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** and **docker-compose** - Service orchestration
- **Node.js** v18+ - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd OAS_Cypress

# Install dependencies
npm install

# Install service dependencies
npm run install:service
```

### 2. Start Services

```bash
# Start all services (OAS, WireMock, LocalStack, SQS init)
docker compose up -d

# Verify services are running
docker compose ps

# Check health of services
curl http://localhost:3000/health
curl http://localhost:8080/__admin/health
curl http://localhost:4566/_localstack/health
```

The `docker-compose.yml` automatically:
- Starts WireMock with SKU stubs
- Starts LocalStack with SQS
- Runs SQS queue initialization (`sqs-init` service)
- Starts Order Assembly Service (depends on above)

### 3. Run Tests

```bash
# Run all tests (headless)
npm test

# Run with Cypress Test Runner (interactive)
npm run test:open

# Run with visible browser (headed mode)
npm run test:headed

# Run specific test file
npx cypress run --spec "cypress/e2e/authentication.cy.js"

# Run with grep pattern
npm test -- --grep "API key"
```

### 4. Stop Services

```bash
# Stop and clean up all services
docker compose down -v

# Or use cleanup script
./scripts/cleanup.sh
```

---

## 🧪 Test Coverage

### Test Files and Categories

| File | Tests | Purpose |
|------|-------|---------|
| **health-check.cy.js** | 6 | Service health endpoint verification |
| **authentication.cy.js** | 8 | API key validation and auth |
| **api-key-lifecycle.cy.js** | 4 | Key expiration & switching |
| **happy-path.cy.js** | 6 | Successful order scenarios |
| **input-validation.cy.js** | 14 | Payload validation & errors |
| **sku-enrichment.cy.js** | 2 | SKU metadata enrichment |
| **dependency-failures.cy.js** | 3 | Catalog service outage (Docker tasks) |
| **sqs-failures.cy.js** | 3 | SQS queue failures |
| **retry-idempotency.cy.js** | 3 | Request retry behavior |
| **partial-failures.cy.js** | 3 | Multiple simultaneous failures |
| **data-driven.cy.js** | 1 | Multiple payload testing |
| **sqs-message-validation.cy.js** | 6 | SQS message content |
| | **59 TOTAL** | |

### Key Testing Areas

✅ **Authentication & Authorization**
- Missing API key → 401
- Invalid API key → 401
- Expired API key → 401
- Case-sensitive key validation
- Multiple key support

✅ **Order Validation**
- Missing required fields (order_id, customer_id, items, timestamp)
- Empty arrays and strings
- Invalid data types
- Negative/zero quantities
- Invalid timestamp formats

✅ **SKU Enrichment**
- Valid SKU metadata lookup
- Invalid SKU handling (502)
- Catalog service unavailability

✅ **Dependency Failures**
- Catalog service outage (real Docker service stop/start)
- SQS queue unavailability
- Timeout handling
- Error message clarity

✅ **Resilience & Retry**
- Duplicate request handling
- Data consistency across retries
- Unique assembly ID generation
- Idempotent operations

✅ **Integration**
- SQS message publishing
- Enriched message content
- Message attributes validation
- Timestamp inclusion

---

## 🔐 API Key Authentication

### Overview
The Order Assembly Service requires API key authentication via the `X-API-Key` header.

### Valid Test Keys

```javascript
// Valid indefinitely
sk-test-valid-key-123456789

// Expires: 2026-02-28
sk-test-limited-key-987654321
```

### Using API Keys in Tests

```javascript
// Default key (automatically included)
apiHelper.post('/orders/assemble', payload)

// Switch to different key
apiHelper.setDefaultApiKey('sk-test-limited-key-987654321')

// Reset to default
apiHelper.resetDefaultApiKey()

// Override key for specific request
cy.request({
  method: 'POST',
  url: '/orders/assemble',
  body: payload,
  headers: { 'x-api-key': 'sk-test-valid-key-123456789' }
})
```

### Error Responses

```json
// Missing key
{ "error": "Unauthorized", "details": "API key is required..." }

// Invalid key
{ "error": "Unauthorized", "details": "Invalid API key provided." }

// Expired key
{ "error": "Unauthorized", "details": "API key has expired." }
```

---

## 🐳 Docker Service Orchestration

### Service Dependencies

Services start in this order:
```
WireMock (healthy)
    ↓
LocalStack (healthy)
    ↓
SQS Init (creates queue)
    ↓
Order Assembly Service (starts)
```

### Automatic Initialization

The `docker-compose.yml` includes:
- **sqs-init service** - Automatically creates `assembled-orders` queue
- **Health checks** - Each service verifies readiness before next starts
- **Networking** - Services communicate via `test-network`

### Catalog Service Outage Testing

Dependency failure tests use special Cypress tasks to stop/start WireMock:

```javascript
// In dependency-failures.cy.js
beforeEach(() => {
  cy.task('stopCatalogService');  // Stops WireMock
  cy.wait(1000);
});

afterEach(() => {
  cy.task('startCatalogService'); // Restarts WireMock
  cy.wait(2000);
});
```

This provides real service outage testing without mocking.

---

## 📊 API Endpoints Reference

### Health Check
```http
GET /health
Response: 200 OK
{
  "status": "healthy",
  "service": "order-assembly-service",
  "timestamp": "2025-01-31T10:00:00Z",
  "version": "1.0.0"
}
```

### Order Assembly
```http
POST /orders/assemble
Headers: x-api-key: sk-test-valid-key-123456789
Content-Type: application/json

Request:
{
  "order_id": "O12345",
  "customer_id": "C900",
  "items": [
    {"sku": "SKU100", "quantity": 2},
    {"sku": "SKU200", "quantity": 1}
  ],
  "order_ts": "2025-01-31T10:12:33Z"
}

Response: 200 OK
{
  "success": true,
  "order_id": "O12345",
  "assembly_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Order assembled and published successfully",
  "sqs_message_id": "message-id-123"
}
```

### Card Catalog Service (WireMock)
```http
GET /catalog/sku/{SKU}

SKU100: Premium Widget Metadata
SKU200: Standard Gadget Metadata
INVALID_SKU: 404 Not Found
```

### SQS Queue (LocalStack)
```
Queue Name: assembled-orders
Region: us-east-1
Messages: Enriched order data with SKU metadata
```

---

## 🔄 GitHub Actions CI/CD

### Automated Workflows

Two workflows run automatically:

1. **test.yml** (On every push and PR)
   - Runs on push to `main` branch
   - Runs on pull requests
   - Manual trigger available

2. **scheduled-test.yml** (Daily at 2 AM UTC)
   - Scheduled daily regression testing
   - Monitors for unexpected failures
   - Manual trigger available

### Test Reports (Mochawesome with Merge)

Both workflows automatically generate comprehensive Mochawesome test reports that merge results from all 12 test files:

- **Report Format**: Interactive HTML report with all tests combined
- **Report Generation**: 
  1. Each spec file generates its own JSON report (`mochawesome-[hash].json`)
  2. All JSON reports are merged into a single `report.json`
  3. HTML report is generated from the merged JSON
- **Metrics**: Pass/fail rates, test duration, error details (aggregated)
- **Availability**: Available as GitHub Actions artifacts
- **Retention**: Configurable per GitHub settings (default 90 days)

### Accessing Reports in GitHub Actions

1. Go to **Actions** tab → Select workflow run
2. Scroll to **Artifacts** section
3. Download the report:
   - `mochawesome-report` (push/PR workflows)
   - `scheduled-mochawesome-report` (scheduled workflows)
4. Extract and open `index.html` in browser to view interactive report

### Report Contents

- ✅ Test pass/fail summary
- ⏱️ Test execution times
- 📊 Success rates and statistics
- 🔍 Detailed test output and error messages
- 📸 Screenshots and videos (linked in report)

### Customization

```bash
# Change schedule time (in scheduled-test.yml)
- cron: '0 2 * * *'  # Change to desired time

# Modify Node.js version
NODE_VERSION: '18'  # Update in both workflows

# Add Slack/email notifications
# See GitHub Actions docs for details
```

---

## 🛠️ Utilities and Helpers

### API Helper (`cypress/utils/api.helper.js`)

```javascript
import { apiHelper } from '../utils/api.helper.js';

// GET request
apiHelper.get('/health')

// POST request  
apiHelper.post('/orders/assemble', payload)

// PUT request
apiHelper.put('/endpoint', payload)

// DELETE request
apiHelper.delete('/endpoint')

// Set/reset API key
apiHelper.setDefaultApiKey(key)
apiHelper.resetDefaultApiKey()
```

### Assertion Helper (`cypress/utils/assertion.helper.js`)

```javascript
import { assertionHelper } from '../utils/assertion.helper.js';

// Validate HTTP status
assertionHelper.validateStatus(response, 200)

// Validate properties exist
assertionHelper.validateProperties(response, ['field1', 'field2'])

// Validate single property value
assertionHelper.validateProperty(response, 'status', 'healthy')

// Validate entire body
assertionHelper.validateBody(response, expectedObject)

// Validate response header
assertionHelper.validateHeader(response, 'content-type', 'application/json')
```

---

## 🔍 Test Data

### Test Fixtures (`cypress/fixtures/`)

**order-payloads.json** - 17 payload variations:
- `validOrder` - Standard valid order
- `validOrderAlt` - Alternative valid order
- `invalidSkuOrder` - Invalid SKU (triggers 502)
- `missingOrderId`, `missingCustomerId` - Missing fields
- `emptyItems`, `missingItems` - Item validation
- `zeroQuantity`, `negativeQuantity` - Quantity validation
- `missingSku`, `invalidTimestamp`, `missingTimestamp` - Format validation

**health-check.json** - Expected health endpoint response

---

## 📝 Configuration

### Environment Variables

```bash
# API Configuration
API_BASE_URL=http://localhost:3000

# Service URLs
CARD_CATALOG_URL=http://localhost:8080
SQS_ENDPOINT=http://localhost:4566
```

### Cypress Config (`cypress.config.js`)

```javascript
{
  baseUrl: 'http://localhost:3000',
  defaultCommandTimeout: 5000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  
  // Docker tasks for service orchestration
  setupNodeEvents(on, config) {
    on('task', {
      stopCatalogService() { /* ... */ },
      startCatalogService() { /* ... */ }
    })
  }
}
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check docker compose logs
docker compose logs -f

# Check specific service
docker compose logs order-assembly-service

# Verify Docker is running
docker ps
```

### Port Conflicts

```bash
# Find process using port
lsof -ti:3000  # OAS Service
lsof -ti:8080  # WireMock
lsof -ti:4566  # LocalStack

# Kill process
lsof -ti:3000 | xargs kill -9
```

### Tests Fail to Connect

```bash
# Verify services are healthy
curl http://localhost:3000/health
curl http://localhost:8080/__admin/health
curl http://localhost:4566/_localstack/health

# Check Cypress info
npx cypress info

# Review error in Cypress UI
npm run test:open
```

### Clear Test Artifacts

```bash
# Remove screenshots and videos
rm -rf cypress/screenshots/ cypress/videos/

# Clean Docker volumes
docker compose down -v
```

### API Key Issues

```bash
# Ensure key is included in headers
# Default: sk-test-valid-key-123456789

# Reset to default in test
apiHelper.resetDefaultApiKey()

# Check API key format is correct
# Format: sk-test-<identifier>
```

---

## 📚 Test Execution Examples

### Run All Tests
```bash
npm test
# Runs all 59 tests
# Output: 59 passing ✅
```

### Run Specific Category
```bash
# Authentication tests only
npm test -- --spec "cypress/e2e/authentication.cy.js"

# Input validation tests
npm test -- --spec "cypress/e2e/input-validation.cy.js"

# Dependency failure tests (with Docker tasks)
npm test -- --spec "cypress/e2e/dependency-failures.cy.js"
```

### Run by Pattern
```bash
# All tests with "API key" in name
npm test -- --grep "API key"

# All authentication-related tests
npm test -- --grep "Authentication"

# All validation tests
npm test -- --grep "validation"
```

### Run in Interactive Mode
```bash
# Opens Cypress Test Runner
npm run test:open

# Allows:
# - Selecting tests to run
# - Watching test execution in browser
# - Debugging with Chrome DevTools
# - Real-time code changes
```

### Generate Local Test Reports

```bash
# Run tests, merge reports, and generate HTML all at once
npm test

# Or run individual commands:
# 1. Run tests and generate individual JSON reports
npm run test

# 2. Just merge existing reports
npm run merge:reports

# 3. Just generate HTML from merged report
npm run generate:html-report

# View in browser
open cypress/reports/index.html
```

**Report Generation Flow:**
1. `cypress run` → Generates `mochawesome-[hash].json` for each spec file
2. `mochawesome-merge` → Combines all JSON files into single `report.json`
3. `mochawesome-report-generator` → Creates interactive `index.html`

---

## 📊 Performance & Cost

### Test Execution Time
- **Full suite**: 5-10 minutes
- **Single file**: 30 seconds - 2 minutes
- **CI/CD per run**: ~10 minutes (includes setup)

### GitHub Actions (Free Tier)
- **Monthly allowance**: 2,000 minutes
- **Estimated usage**: 250-500 minutes (well within limit)
- **Storage**: ~50-100 MB per month (within 500 MB limit)

### CI/CD Coverage
- ✅ On every push to main
- ✅ On every pull request
- ✅ Daily scheduled run
- ✅ Manual trigger available

---

## 🔐 Security Notes

⚠️ **API Keys for Testing Only**
- Test keys are hardcoded for development
- Never use in production
- Implement real key management for production

### Production Recommendations
- [ ] Use secure key vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Implement JWT tokens instead of API keys
- [ ] Add rate limiting per key
- [ ] Log all authentication attempts
- [ ] Implement key rotation
- [ ] Add IP whitelisting
- [ ] Use HTTPS/TLS for all requests

---

## 🎯 Next Steps

1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Start services (`docker compose up -d`)
4. ✅ Run tests (`npm test`)
5. ✅ View CI/CD results in GitHub Actions
6. 🔄 Add new tests as needed
7. 🚀 Deploy to production with proper security

---

## 📞 Support & Issues

For issues or questions:
1. Check test logs: `npm test`
2. Review error messages in Cypress UI: `npm run test:open`
3. Check service logs: `docker compose logs`
4. Verify services are running: `docker compose ps`

---

## 📄 License

This project is provided as-is for testing and development purposes.

---

**Last Updated:** February 1, 2026  
**Test Suite Version:** 2.0 (Modular with 12 files, 59 tests)  
**Node.js Version:** 18+  
**Docker Compose:** 3.8+
