import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/rbacMiddleware";
import * as taskController from "../controllers/taskController";

const router = Router();

router.use(authenticateToken);

// GET: Requires Read Permission (Viewers have this)
router.get("/", requirePermission("read:tasks"), taskController.getTasks);

// POST: Requires Write Permission (Admins/Managers only)
router.post("/", requirePermission("write:tasks"), taskController.createTask);

// PUT: CHANGE THIS -> Use 'read:tasks' so Viewers can enter (Controller will filter)
router.put("/:id", requirePermission("read:tasks"), taskController.updateTask);

// DELETE: Requires Write Permission (Admins/Managers only)
router.delete(
  "/:id",
  requirePermission("write:tasks"),
  taskController.deleteTask,
);

export default router;
