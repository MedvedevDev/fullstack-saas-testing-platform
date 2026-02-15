import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/rbacMiddleware";
import * as userController from "../controllers/userController";

const router = Router();

router.get("/me", authenticateToken, userController.getMyProfile);
router.put("/me", authenticateToken, userController.updateMyProfile);

router.get(
  "/",
  authenticateToken,
  requirePermission("manage:users"),
  userController.getAllUsers,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission("manage:users"), // Or define a specific 'delete:users' permission if strictly Admin only
  userController.deleteUser,
);

export default router;
