import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  AuthRequest,
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";
import * as dotenv from "dotenv";

dotenv.config();

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/users/me
 * Get current logged in user profile and roles
 */
router.get(
  "/me",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roles: { select: { name: true } },
        },
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  },
);

/**
 * GET /api/users
 * List all users (Restricted to ADMIN/MANAGER)
 * Useful for testing data visibility and RBAC
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roles: { select: { name: true } },
          createdAt: true,
        },
      });

      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },
);

/**
 * DELETE /api/users/:id
 * Remove a user account (Restricted to ADMIN only)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Check if user exists before attempting deletion
      const targetUser = await prisma.user.findUnique({
        where: { id: id as string },
      });
      if (!targetUser) return res.status(404).json({ error: "User not found" });

      await prisma.user.delete({
        where: { id: id as string },
      });

      // Audit log for the deletion
      await recordActivity(
        req.user!.userId,
        `USER_DELETED: ${targetUser.email}`,
      );

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

export default router;
