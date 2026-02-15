import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/rbacMiddleware";
import * as userController from "../controllers/userController";

const router = Router();

router.get("/me", authenticateToken, userController.getMyProfile);
router.put("/me", authenticateToken, userController.updateMyProfile);

// Admin Routes
router.get(
  "/",
  authenticateToken,
  requirePermission("manage:users"),
  userController.getAllUsers,
);

//  Create User (Admin only)
router.post(
  "/",
  authenticateToken,
  requirePermission("manage:users"),
  userController.createUser,
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("manage:users"),
  userController.deleteUser,
);

export default router;
