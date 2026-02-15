import { Router } from "express";
import {
  getProjectProgress,
  getUserPerformance,
} from "../controllers/analyticsController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/rbacMiddleware";

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// GET /api/analytics/projects/:projectId/progress
// Currently restricted to Admins via 'view:analytics' permission
router.get(
  "/projects/:projectId/progress",
  requirePermission("view:analytics"),
  getProjectProgress,
);

// GET /api/analytics/users/performance
// Currently restricted to Admins via 'view:analytics' permission
router.get(
  "/users/performance",
  requirePermission("view:analytics"),
  getUserPerformance,
);

export default router;
