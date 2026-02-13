import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import * as taskController from "../controllers/taskController";

const router = Router();

router.use(authenticateToken); // Protect all routes

router.get("/", taskController.getTasks);
router.post("/", authorizeRoles("ADMIN", "MANAGER"), taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER"),
  taskController.deleteTask,
);

export default router;
