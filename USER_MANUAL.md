# SaaS Dashboard User Manual

This document provides a detailed description of the SaaS Dashboard application's functionality.

## 1. Introduction

The SaaS Dashboard is a web-based application designed to help teams manage their projects, tasks, and users. It provides a centralized platform for tracking progress, assigning tasks, and monitoring user activity.

## 2. Roles and Permissions

The application has three user roles with different levels of access:

*   **Admin:** Has full access to all features, including user management, project creation, and task management.
*   **Manager:** Can manage projects and tasks, and view users.
*   **Viewer:** Can only view projects and tasks they are assigned to.

## 3. Core Features

### 3.1. Authentication

*   **Login:** Users can log in to the application using their email and password.
*   **Logout:** Users can log out of the application.

### 3.2. Dashboard

The dashboard provides an overview of the user's projects and tasks.

*   **Statistics:** Displays key metrics such as total projects, total users, and a breakdown of tasks by status (To Do, In Progress, Done).
*   **Recent Activity:** Shows a log of recent actions performed by users.

### 3.3. Projects

The projects section allows users to manage their projects.

*   **Project List:** Displays a list of all projects with their name, description, status, and creation date.
*   **Create Project:** Admins and Managers can create new projects by providing a name and description.
*   **Edit Project:** Admins and Managers can edit existing projects.
*   **Delete Project:** Admins and Managers can delete projects.
*   **Project Details:** Clicking on a project takes the user to the project details page, which shows a list of tasks associated with that project.

### 3.4. Tasks

The tasks section allows users to manage their tasks.

*   **Task List:** Displays a list of all tasks with their title, status, priority, assigned user, and due date.
*   **Create Task:** Admins and Managers can create new tasks, assigning them to a project and a user.
*   **Edit Task:** Admins and Managers can edit existing tasks.
*   **Delete Task:** Admins and Managers can delete tasks.
*   **Task Board (Kanban):** A Kanban board view of all tasks, allowing users to drag and drop tasks between columns (To Do, In Progress, Done) to update their status.

### 3.5. Users

The users section allows Admins to manage users.

*   **User List:** Displays a list of all users with their name, email, role, and join date.
*   **Create User:** Admins can create new users by providing a name, email, and role.
*   **Delete User:** Admins can delete users.

### 3.6. Settings

The settings page allows users to manage their account.

*   **Profile:** Users can update their first and last name.
*   **Password:** Users can change their password.
-
## 4. Tech Stack

### 4.1. Frontend

*   **Framework:** React
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **HTTP Client:** Axios
*   **Routing:** React Router
*   **State Management:** React Context

### 4.2. Backend

*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** JWT
