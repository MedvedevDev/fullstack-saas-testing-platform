import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/rbacMiddleware";
import * as projectController from "../controllers/projectController";

const router = Router();

// Apply global auth to all project routes
router.use(authenticateToken);

// Create: Admin or Manager
router.post(
  "/",
  requirePermission("write:projects"),
  projectController.createProject,
);

// Read: Any authenticated user (filtered by ownership in controller)
router.get(
  "/",
  requirePermission("read:projects"),
  projectController.getProjects,
);

// Get particular project
router.get(
  "/:id",
  requirePermission("read:projects"),
  projectController.getProjectById,
);

// Update: Admin or Manager
router.put(
  "/:id",
  requirePermission("write:projects"),
  projectController.updateProject,
);

// Delete: Admin only
router.delete(
  "/:id",
  requirePermission("delete:projects"),
  projectController.deleteProject,
);

export default router;
