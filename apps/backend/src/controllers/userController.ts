import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";

// GET /api/users/me
export const getMyProfile = async (req: AuthRequest, res: Response) => {
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
};

// GET /api/users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
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
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // 1. Prevent deleting yourself
    if (id === req.user?.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account." });
    }

    // 2. SAFETY CHECK: Do they own projects?
    const projectCount = await prisma.project.count({ where: { ownerId: id } });
    if (projectCount > 0) {
      return res.status(400).json({
        error: `Cannot delete user: They own ${projectCount} active projects. Please delete or reassign them first.`,
      });
    }

    // 3. SAFETY CHECK: Are they assigned to tasks?
    const taskCount = await prisma.task.count({ where: { assigneeId: id } });
    if (taskCount > 0) {
      return res.status(400).json({
        error: `Cannot delete user: They are assigned to ${taskCount} active tasks. Please unassign them first.`,
      });
    }

    // 4. Clean up logs and delete user
    // We delete logs first because they are safe to remove
    await prisma.activityLog.deleteMany({ where: { userId: id } });

    const deletedUser = await prisma.user.delete({ where: { id } });

    await recordActivity(
      req.user!.userId,
      `USER_DELETED: ${deletedUser.email}`,
    );
    res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};
