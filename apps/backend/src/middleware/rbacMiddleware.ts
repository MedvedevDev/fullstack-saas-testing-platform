import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

// Define Roles based on your proposal
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  VIEWER = "VIEWER",
}

// Define granular permissions
export type Permission =
  | "read:projects"
  | "write:projects"
  | "delete:projects"
  | "manage:project_settings"
  | "read:tasks"
  | "write:tasks"
  | "manage:users"
  | "view:analytics";

// Map Roles to Permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    "read:projects",
    "write:projects",
    "delete:projects",
    "manage:project_settings",
    "read:tasks",
    "write:tasks",
    "manage:users",
    "view:analytics",
  ],
  [UserRole.MANAGER]: [
    "read:projects",
    "write:projects",
    "manage:project_settings",
    "read:tasks",
    "write:tasks",
    "manage:users", // Can manage members within their projects
  ],
  [UserRole.VIEWER]: ["read:projects", "read:tasks"],
};

/**
 * Middleware factory to check if the authenticated user has the required permission.
 */
export const requirePermission = (requiredPermission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.roles) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    // Check if ANY of the user's roles grant the required permission
    const hasPermission = user.roles.some((roleName) => {
      const role = roleName as UserRole;
      const permissions = ROLE_PERMISSIONS[role];
      return permissions && permissions.includes(requiredPermission);
    });

    if (!hasPermission) {
      return res.status(403).json({
        error: `Forbidden: You do not have permission to ${requiredPermission}`,
      });
    }

    next();
  };
};

/**
 * Helper to check if a user is an Admin
 */
export const requireAdmin = requirePermission("delete:projects");
