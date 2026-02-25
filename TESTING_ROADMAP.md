# Testing Roadmap

**Phase 1: Foundation & First End-to-End Test (Completed)**

- [x] Basic Playwright setup.
- [x] Create foundational Page Object Models (e.g., `SidebarComponent`).
- [x] Write a complete E2E test for the authentication flow (`auth.spec.ts`).

**Phase 2: Expanding Core Feature Coverage (Completed)**

- [x] Write tests for the Projects page (viewing, creating, and searching for projects).
- [x] Write tests for the Tasks page (viewing, creating, and managing tasks).
- [x] Implement tagging (`@smoke`, `@regression`, `@projects`) to categorize tests.

**Phase 3: Enhancing Reusability & Data Management (Completed)**

- [x] Create reusable helper functions (e.g., a custom `login` command).
- [x] Develop a strategy for creating and cleaning up test data.

**Phase 4: Advanced Testing & Reporting (Current)**

- [ ] **E2E Flows:** Testing the full journey.
  - [ ] **Admin Onboarding:** An Admin creates a new `MANAGER` user and a new `PROJECT`.
  - [ ] **Manager Project Setup:** A `MANAGER` logs in, creates several `TASKS` within their project, and assigns them to other users.
  - [ ] **Viewer Task Completion:** A `VIEWER` logs in, finds an assigned task on the global tasks page, and updates its status to "Done".
  - [ ] **Full Lifecycle:** A single test that follows a task from creation by an Admin, assignment to a Viewer, completion by the Viewer, and final verification by the Admin.
  - [ ] **RBAC Security Check:** Verify that a `VIEWER` cannot access the Users page or create projects via direct URL navigation.
  - [ ] **Task Re-assignment:** A `MANAGER` re-assigns a task from User A to User B. Verify User A loses access and User B gains access.
  - [ ] **Project Deletion Cascade:** Create a project with tasks, then delete the project. Verify all associated tasks are removed from the Global Tasks view.
  - [ ] **User Role Promotion:** An `ADMIN` promotes a `VIEWER` to `MANAGER`. Verify the user gains "Create Project" capabilities after re-login.
  - [ ] **Profile Update:** A user updates their password and name. Verify they can log in with the new credentials and see the updated name.
  - [ ] **Dashboard Data Consistency:** Create specific projects and tasks (e.g., 1 Active, 2 Completed). Verify Dashboard counters/charts match exactly.
  - [ ] **Dashboard Empty State:** Login as a new user. Verify Dashboard shows correct "0 Projects" state and "Get Started" prompts.
  - [ ] **API Authorization:** A `VIEWER` attempts to delete a project via API directly. Verify 403 Forbidden.
  - [ ] **Direct URL Access:** A `VIEWER` tries to navigate to `/users` (Admin only page). Verify redirection to Dashboard or Error page.
  - [ ] **Orphaned Data Handling:** Assign a task to a user, then delete that user. Verify the task remains but becomes "Unassigned".
  - [ ] **Logout Security:** Verify that clicking "Back" after logout does not reveal the dashboard.
- [ ] **API Testing:** Verifying the backend directly.
- [ ] **Visual Regression:** Ensuring the UI doesn't look "broken" after updates.
- [ ] Implement accessibility checks.
- [ ] Configure advanced reporting for test results.

**Phase 5: Concurrent E2E Flows (Multi-Actor Scenarios)**

- [ ] **Real-time Task Deletion:** A `MANAGER` deletes a task while a `VIEWER` is looking at the project list. Verify the task disappears from the `VIEWER`'s screen without a page refresh.
- [ ] **Real-time Status Change:** A `VIEWER` changes a task's status on the Kanban board. Verify the change is immediately visible to a `MANAGER` viewing the same board.
- [ ] **Concurrent Edit Conflict:** A `MANAGER` and a `VIEWER` both open the edit modal for the same task. The `MANAGER` saves a change first. Verify the `VIEWER` receives a "This task has been updated" notification upon trying to save.
- [ ] **Live Assignment Notification:** An `ADMIN` assigns a new task to a `VIEWER`. Verify the task count on the `VIEWER`'s dashboard updates in real-time.
- [ ] **Permission Revocation:** An `ADMIN` revokes a `MANAGER`'s access while they are actively using the site. Verify the `MANAGER` is redirected to a "Permission Denied" page or logged out on their next action.
