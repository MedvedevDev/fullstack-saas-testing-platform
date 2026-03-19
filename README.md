# SaaS Dashboard

This project is a portfolio for test automation using Playwright. It uses a full-stack SaaS application (React + Node.js) as a canvas to demonstrate a testing strategy for a real-world project and task management tool.

## Testing Strategy

This project is extensively tested to ensure quality and demonstrate a robust automation strategy. The test suite, built with Playwright, includes:

- **End-to-End (E2E) Tests:** Covering core user journeys like admin onboarding, project setup, and full task lifecycles.
- **API & Security Tests:** Validating API endpoints and role-based access control (RBAC) to prevent unauthorized actions.
- **Data Integrity Tests:** Ensuring data consistency across the application for critical actions.
- **CI/CD Integration:** All tests are run automatically on every push via GitHub Actions.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Docker](https://www.docker.com/)

### 1. Installation

```bash
# Clone the repository and navigate into it
git clone <repository-url>
cd saas-dashboard

# Install backend and frontend dependencies
npm install --prefix apps/backend
npm install --prefix apps/frontend
```

### 2. Database Setup

```bash
# Start the PostgreSQL container
docker-compose up -d

# Apply database migrations and seed it with test data
npx --prefix apps/backend prisma migrate dev
npx --prefix apps/backend prisma db seed
```

### 3. Run the Application

```bash
# In one terminal, start the backend server
npm run dev --prefix apps/backend
# Backend runs on http://localhost:3000

# In another terminal, start the frontend server
npm run dev --prefix apps/frontend
# Frontend runs on http://localhost:5173
```

### 4. Running Tests

```bash
# Install Playwright browsers
npx playwright install

# Execute the entire Playwright test suite
npx playwright test
```
