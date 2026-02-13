import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import * as tagController from "../controllers/tagController";

const router = Router();

router.use(authenticateToken);

router.get("/", tagController.getTags);
router.post("/", authorizeRoles("ADMIN", "MANAGER"), tagController.createTag);
router.put("/:id", authorizeRoles("ADMIN", "MANAGER"), tagController.updateTag);
router.delete("/:id", authorizeRoles("ADMIN"), tagController.deleteTag);

export default router;
