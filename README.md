# SaaS Dashboard - A Playwright Test Automation Portfolio

This project showcases a comprehensive test automation strategy for a modern SaaS dashboard application. The application itself, a full-stack solution with a React frontend and a Node.js backend, serves as the playground for demonstrating advanced end-to-end testing techniques using **Playwright**.

The primary goal of this repository is to serve as a living portfolio of test automation skills, covering everything from test architecture design to CI/CD integration.

## The Application Under Test (AUT)

The SaaS Dashboard is a feature-rich application for managing projects, tasks, and users. Its key features provide a wide range of scenarios for robust test automation.

### Features

-   **User Authentication:** Role-based access control (Admin, Manager, Viewer).
-   **Project Management:** Create, read, update, and delete projects.
-   **Task Management:** A full suite of task operations within projects.
-   **Interactive Kanban Board:** A drag-and-drop interface for managing task status.
-   **User Administration:** User creation and management for admins.

## Test Automation Showcase

This section details the test automation architecture, strategies, and advanced scenarios implemented in this project.

### Automation Engineering Responsibilities

-   **Test Architecture:** Designing a scalable and maintainable test framework.
-   **Test Implementation:** Writing robust and reliable Playwright tests.
-   **Data Management:** Creating fixtures, data factories, and a comprehensive test data strategy.
-   **API Integration:** Implementing API helpers for efficient test setup and teardown.
-   **CI/CD Pipeline:** Building and configuring a CI pipeline for continuous testing, including parallel test execution.
-   **Database Interaction:** Working directly with the database for test data seeding and cleanup.
-   **Flake Resistance:** Implementing strategies to handle and mitigate flaky tests, including retry logic.
-   **Reporting:** Integrating comprehensive test reporting for clear and actionable results.
-   **Test Organization:** Using tagging to create targeted test suites (e.g., smoke, regression).

### UI Testing Opportunities

The application's UI presents numerous opportunities for targeted testing:

-   **Forms:** Extensive validation testing for all input forms.
-   **Dynamic Tables:** Testing sorting and filtering functionality.
-   **Asynchronous UI:** Handling dynamic loading of dropdowns and other elements.
-   **Modals:** Verifying interactions with modal dialogs.
-   **RBAC:** Ensuring UI elements are displayed or hidden based on user roles.
-   **Network Interception:** Mocking API responses to test error handling and edge cases.
-   **UI States:** Testing optimistic updates, loading spinners, and empty state placeholders.

### Advanced Automation Scenarios

This project demonstrates several advanced automation techniques:

-   **API-Driven Test Setup:** Using the API to set up test conditions efficiently.
-   **Database Seeding:** Seeding the database with specific data sets for predictable test runs.
-   **Parallel Execution:** Running tests in parallel to reduce feedback time.
-   **Visual Regression Testing:** Detecting unintended visual changes in the UI.
-   **Flake Handling:** Implementing retry logic and other strategies to manage flaky tests.
-   **CI Artifacts:** Generating and storing test reports and other artifacts in the CI pipeline.

## Getting Started

Follow these instructions to get the application and the test suite running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later)
-   [npm](https://www.npmjs.com/)
-   [Docker](https://www.docker.com/) (for running the PostgreSQL database)

### Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd saas-dashboard
    ```

2.  **Install dependencies:**

    ```bash
    # Install backend dependencies
    cd apps/backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install

    # Go back to the root directory
    cd ../..
    ```

3.  **Set up the database:**

    -   **Start the database:**
        ```bash
        docker-compose up -d
        ```

    -   **Apply migrations:**
        ```bash
        cd apps/backend
        npx prisma migrate dev
        ```

    -   **Seed the database:**
        ```bash
        npx prisma db seed
        ```

4.  **Running the application:**

    -   **Start the backend:**
        ```bash
        cd apps/backend
        npm run dev
        ```

    -   **Start the frontend:**
        ```bash
        cd apps/frontend
        npm run dev
        ```

### Running the Tests

1.  **Install Playwright:**

    ```bash
    npm install -D @playwright/test
    ```

2.  **Execute the test suite:**

    ```bash
    npx playwright test
    ```

    To run the tests in headed mode, use the `--headed` flag:

    ```bash
    npx playwright test --headed
    ```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that runs the full test suite on every push to the `main` branch, ensuring that the automation code is always in a healthy state.