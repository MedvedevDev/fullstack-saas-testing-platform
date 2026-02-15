# Proposed Feature Enhancements for SaaS Dashboard

This document outlines proposed features to enhance the functionality, user experience, and analytical capabilities of the SaaS Admin Dashboard.

---

## 1. Enhanced Dashboard Analytics

While the current dashboard provides useful stats, we can introduce more dynamic and visual analytics to give users deeper insights at a glance.

### Key Features:

- **Project Progress Visualization:**
  - Implement a chart (e.g., a pie or donut chart) to show the distribution of tasks by status (e.g., To Do, In Progress, Done) for a selected project.
  - Add a timeline view (like a Gantt chart) to visualize project schedules and task durations.
- **User Performance Metrics:**
  - Display charts showing tasks completed per user over a specific period (e.g., last 7 days, last 30 days).
  - Show a leaderboard of top-performing users based on completed tasks.
- **Activity Heatmap:**
  - Create a heatmap to visualize the busiest days of the week or times of the day for project activity.

---

## 2. Advanced Task Management

To make the task management system more powerful and flexible, we can add features commonly found in modern project management tools.

### Key Features:

- **Sub-tasks:**
  - Allow users to create a checklist or a nested list of sub-tasks within a parent task.
  - The parent task's progress could be automatically updated based on the completion of its sub-tasks.
- **Task Dependencies:**
  - Introduce the ability to define relationships between tasks, such as "blocks" or "is blocked by."
  - This would prevent a task from being moved to "In Progress" or "Done" if its dependencies are not yet met.
- **File Attachments:**
  - Add a feature to upload and attach files (e.g., documents, images, mockups) directly to a task.
  - Include a preview for common file types.
- **Calendar View:**
  - In addition to the Kanban and list views, add a calendar view that displays tasks based on their due dates.

---

## 3. Settings Page Improvements

We can enhance the settings page to give users more control over their experience.

### Key Features:

- **Profile Picture Upload:**
  - Allow users to upload and change their profile picture.
- **Notification Preferences:**
  - Give users granular control over which notifications they receive (e.g., task assignments, comments, mentions) and how they receive them (e.g., in-app, email digest).
- **Theme Selection:**
  - Implement a dark mode/light mode toggle to improve accessibility and user comfort.

---

## 4. Refined Role-Based Access Control (RBAC)

To improve security and administrative control, we can create a more robust and centralized RBAC system on the backend.

### Current State:

The "Viewer" role has some restrictions, but the logic is likely spread out across different parts of the codebase.

### Proposed Implementation:

- **Centralized Middleware:**
  - Create a dedicated middleware in the backend that checks user permissions for specific actions (e.g., `can-edit-task`, `can-delete-project`).
  - This middleware would be applied to the relevant API routes, ensuring that permissions are consistently enforced.
- **Expanded Roles:**
  - Formally define the permissions for each role:
    - **Viewer:** Read-only access to projects and tasks. Cannot create, edit, or delete anything.
    - **Member/Editor:** Can create, edit, and manage tasks within their assigned projects. Cannot edit project settings or delete projects.
    - **Manager:** Has full control over assigned projects, including editing settings and adding/removing members.
    - **Admin:** Has global access to all projects, users, and settings in the system.
