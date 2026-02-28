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

## 🔵 Phase 4: Advanced Testing & E2E Flows

**1. Core User Journeys (The Happy Paths)**

- [ ] **Admin Onboarding:** An Admin creates a new `MANAGER` user and a new `PROJECT`.
- [ ] **Manager Project Setup:** A `MANAGER` logs in, creates several `TASKS`, and assigns them.
- [x] **Viewer Task Completion:** A `VIEWER` logs in, finds an assigned task using `hasText`, and updates it to "Done".
- [ ] **Full Lifecycle:** A single test following a task from Admin creation -> Viewer completion -> Admin verification.
- [x] **Dashboard Data Consistency:** Verify Dashboard counters/charts match exactly after API setup.
- [x] **Dashboard Empty State:** Login as a new user. Verify Dashboard shows correct "0 Projects" state.

**2. RBAC & Security (Access Control)**

- [x] **API Authorization:** A `VIEWER` attempts to delete a project via API directly. Verify 403.
- [ ] **RBAC Security Check:** Verify a `VIEWER` cannot see the "Create Project" button (using strict ARIA roles).
- [ ] **Direct URL Access:** A `VIEWER` tries to navigate to `/users`. Verify redirection.
- [ ] **Logout Security:** Verify that clicking browser "Back" after logout does not reveal the dashboard.

**3. Data Integrity & Edge Cases**

- [ ] **Task Re-assignment:** A `MANAGER` re-assigns a task from User A to User B.
- [ ] **Project Deletion Cascade:** Delete a project via API. Verify UI removes all associated tasks.
- [ ] **Orphaned Data Handling:** Assign a task, then delete the user via API. Verify task becomes "Unassigned" in UI.
- [ ] **NEW: Activity Log Sync:** Complete a task. Verify the "Activity Log" displays the exact action using `hasText`.

**4. User Account Management**

- [ ] **User Role Promotion:** An `ADMIN` promotes a `VIEWER` to `MANAGER`. Verify they gain UI permissions.
- [ ] **Profile Update:** A user updates their password and name. Verify login with new credentials.
- [ ] **NEW: Accessibility Navigation:** Navigate the User Settings form entirely using `getByLabel` and `getByRole` to catch missing ARIA attributes.

**Phase 5: Concurrent E2E Flows (Multi-Actor Scenarios)**

- [ ] **Real-time Task Deletion:** A `MANAGER` deletes a task while a `VIEWER` is looking at the project list. Verify the task disappears from the `VIEWER`'s screen without a page refresh.
- [ ] **Real-time Status Change:** A `VIEWER` changes a task's status on the Kanban board. Verify the change is immediately visible to a `MANAGER` viewing the same board.
- [ ] **Concurrent Edit Conflict:** A `MANAGER` and a `VIEWER` both open the edit modal for the same task. The `MANAGER` saves a change first. Verify the `VIEWER` receives a "This task has been updated" notification upon trying to save.
- [ ] **Live Assignment Notification:** An `ADMIN` assigns a new task to a `VIEWER`. Verify the task count on the `VIEWER`'s dashboard updates in real-time.
- [ ] **Permission Revocation:** An `ADMIN` revokes a `MANAGER`'s access while they are actively using the site. Verify the `MANAGER` is redirected to a "Permission Denied" page or logged out on their next action.
