export type UserRole = "ADMIN" | "MANAGER" | "VIEWER";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
}

export interface Task {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  projectId: string;
  assigneeId?: string;
}
