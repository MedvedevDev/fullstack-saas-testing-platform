# Testing Roadmap

## Phase 1: E2E Flows

### Core User Journeys (Completed)

- [x] **Admin Onboarding:** An Admin creates a new `MANAGER` user and a new `PROJECT`.
- [x] **Manager Project Setup:** A `MANAGER` logs in, creates several `TASKS`, and assigns them.
- [x] **Viewer Task Completion:** A `VIEWER` logs in, finds an assigned task using `hasText`, and updates it to "Done".
- [x] **Full Lifecycle:** A single test following a task from Admin creation -> Viewer completion -> Admin verification.
- [x] **Dashboard Data Consistency:** Verify Dashboard counters/charts match exactly after API setup.
- [x] **Dashboard Empty State:** Login as a new user. Verify Dashboard shows correct "0 Projects" state.

### Role Interaction Flows (Manager-Viewer-Admin)

- [x] **Manager Task Assignment & Viewer Workflow:** A `MANAGER` creates a project, creates multiple tasks, assigns them to a `VIEWER`. The `VIEWER` logs in, locates assigned tasks, updates their status to "In Progress", then "Done". The `MANAGER` verifies all updates are reflected in the project.
- [ ] **Manager Project Control Verification:** A `MANAGER` creates a project, successfully edits project details (name, description), verifies edit button is visible. A `VIEWER` in the same project attempts to navigate to project details and verifies "Edit" button is NOT visible.
- [ ] **Task Reassignment Chain:** An `ADMIN` creates a task assigned to a `MANAGER`. The `MANAGER` reassigns the task to a `VIEWER`. The `VIEWER` completes the task. An `ADMIN` verifies the task completion and full reassignment history is visible.
- [ ] **Multi-Project Visibility:** An `ADMIN` creates two projects and several tasks across them. A `VIEWER` is assigned tasks only in Project A but not Project B. The `VIEWER` logs in, verifies they see only tasks from Project A on their tasks page, and cannot access Project B's tasks.
- [ ] **Admin Role Escalation:** An `ADMIN` creates a `VIEWER` user, assigns them a task. The `VIEWER` logs in and verifies they cannot see "Create Project" or "Create Task" buttons. The `ADMIN` changes the `VIEWER`'s role to `MANAGER` via the Users page. The user logs out and back in, verifies the "Create Project" button is now visible.

### User Management & Settings Flows

- [ ] **Collaborative Task-Commenting:** A `MANAGER` creates a project and assigns a `VIEWER`. The `VIEWER` then adds comments to a task, and the `MANAGER` verifies these comments are visible.
- [ ] **User Self-Service (Profile Update):** A user updates their own profile information on the Settings page, logs out, and successfully logs back in with their new credentials.
- [ ] **Comprehensive User Administration:** An `ADMIN` uses the Users page to create a new user, edit an existing user's role (e.g., from `VIEWER` to `MANAGER`), and finally delete a user.

---

## Phase 2: Security (Access Control) - UI Only

### VIEWER Role Restrictions (UI-Based)

- [x] **RBAC Security Check:** Verify a `VIEWER` cannot see the "Create Project" button (using strict ARIA roles).
- [x] **Direct URL Access:** A `VIEWER` tries to navigate to `/users`. Verify redirection.
- [x] **Logout Security:** Verify that clicking browser "Back" after logout does not reveal the dashboard.
- [ ] **Viewer RBAC (Project Details):** A logged-in `VIEWER` navigates to a project's detail page and verifies that no "Edit Project" or "Delete Project" controls are visible or enabled.
- [ ] **Viewer RBAC (Task Creation):** A logged-in `VIEWER` is on the tasks page and verifies the "Create Task" button is not visible.
- [ ] **Viewer Cannot Edit Task Assignee:** A `VIEWER` is assigned a task. They open the task edit modal and verify the "Assignee" dropdown is either disabled or not visible (cannot reassign the task).
- [ ] **Viewer Cannot Modify Task Priority:** A `VIEWER` is assigned a High priority task. They attempt to modify the priority field and verify the field is disabled or change is not persisted.
- [ ] **Viewer Cannot Delete Tasks:** A `VIEWER` is assigned a task. They verify the "Delete Task" button is not visible or is disabled in the task row.
- [ ] **Viewer Settings Access:** A `VIEWER` can access and update only their own profile settings but cannot access team admin settings.

### MANAGER Role Restrictions (UI-Based)

- [ ] **Manager RBAC (User Page):** A logged-in `MANAGER` attempts to directly navigate to the `/users` page and is redirected or shown a "Permission Denied" message.
- [ ] **Manager RBAC (Project Deletion):** A logged-in `MANAGER` navigates to the projects page and verifies that no "Delete Project" button is visible (Managers cannot delete projects).
- [ ] **Manager Can Edit Own Projects:** A `MANAGER` creates a project, successfully navigates to its details, edits the name/description, and verifies changes are saved without requiring admin approval.
- [ ] **Manager Cannot Edit Other Managers' Projects:** A `MANAGER` attempts to navigate to a project created by a different `MANAGER` and verifies no "Edit" or "Delete" options are visible.
- [ ] **Manager Cannot Access Analytics/Admin Panels:** A `MANAGER` attempts to navigate to `/admin` or any admin-only sections and is redirected to dashboard.
- [ ] **Manager RBAC (Task Reassignment Limits):** A `MANAGER` can reassign tasks only to users (VIEWERs) within their own project context. They cannot assign tasks outside their projects.

### ADMIN Access Control

- [x] **API Authorization:** A `VIEWER` attempts to delete a project via API directly. Verify 403.
- [ ] **Admin Verified Create Access:** An `ADMIN` successfully creates users, projects, and tasks with full UI controls visible.
- [ ] **Admin Verified Delete Access:** An `ADMIN` successfully deletes projects, tasks, and users with delete buttons visible throughout.
- [ ] **Admin Full RBAC:** An `ADMIN` can navigate to any page (`/users`, `/projects`, `/tasks`, `/settings`) without redirection.

---

## Phase 5: Concurrent E2E Flows (Multi-Actor Scenarios)

- [ ] **Real-time Task Deletion:** A MANAGER deletes a task while a VIEWER is looking at the project list. Verify the task disappears from the VIEWER's screen without a page refresh.
- [ ] **Real-time Status Change:** A VIEWER changes a task's status on the Kanban board. Verify the change is immediately visible to a MANAGER viewing the same board.
- [ ] **Concurrent Edit Conflict:** A MANAGER and a VIEWER both open the edit modal for the same task. The MANAGER saves a change first. Verify the VIEWER receives a "This task has been updated" notification upon trying to save.
- [ ] **Live Assignment Notification:** An ADMIN assigns a new task to a VIEWER. Verify the task count on the VIEWER's dashboard updates in real-time.
- [ ] **Permission Revocation:** An ADMIN revokes a MANAGER's access while they are actively using the site. Verify the MANAGER is redirected to a "Permission Denied" page or logged out on their next action.
