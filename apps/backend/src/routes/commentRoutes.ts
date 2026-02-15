import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import * as commentController from "../controllers/commentController";

const router = Router();

// Apply global auth to all comment routes
router.use(authenticateToken);

// Get all comments for a task (via query parameter)
router.get("/", commentController.getCommentsForTask);

// Create a new comment
router.post("/", commentController.createComment);

// Update a comment (owner or admin/manager)
router.put("/:id", commentController.updateComment);

// Delete a comment (owner or admin/manager)
router.delete("/:id", commentController.deleteComment);

export default router;
