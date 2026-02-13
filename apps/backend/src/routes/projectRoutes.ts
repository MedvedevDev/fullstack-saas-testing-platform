import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import * as projectController from "../controllers/projectController";

const router = Router();

// Apply global auth to all project routes
router.use(authenticateToken);

// Create: Admin or Manager
router.post(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  projectController.createProject,
);

// Read: Any authenticated user (filtered by ownership in controller)
router.get("/", projectController.getProjects);

// Get particular project
router.get("/:id", projectController.getProjectById);

// Update: Admin or Manager
router.put(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER"),
  projectController.updateProject,
);

// Delete: Admin only
router.delete("/:id", authorizeRoles("ADMIN"), projectController.deleteProject);

export default router;
