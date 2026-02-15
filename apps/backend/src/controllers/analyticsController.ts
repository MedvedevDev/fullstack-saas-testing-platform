import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * GET /api/analytics/projects/:projectId/progress
 */
export const getProjectProgress = async (req: AuthRequest, res: Response) => {
  try {
    // FIX: Cast to string to satisfy TypeScript
    const projectId = req.params.projectId as string;

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const stats = await prisma.task.groupBy({
      by: ["status"],
      where: { projectId }, // Now this works
      _count: {
        status: true,
      },
    });

    const formattedStats = stats.map((stat) => ({
      name: stat.status,
      value: stat._count.status,
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch project progress" });
  }
};

/**
 * GET /api/analytics/users/performance
 */
export const getUserPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const performance = await prisma.task.groupBy({
      by: ["assigneeId"],
      where: {
        status: "DONE",
        assigneeId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const userIds = performance
      .map((p) => p.assigneeId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const result = performance.map((p) => {
      const user = users.find((u) => u.id === p.assigneeId);
      return {
        name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        completedTasks: p._count.id,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch user performance" });
  }
};
