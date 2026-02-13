import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import * as userController from "../controllers/userController";

const router = Router();

router.get("/me", authenticateToken, userController.getMyProfile);
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  userController.getAllUsers,
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  userController.deleteUser,
);

export default router;
