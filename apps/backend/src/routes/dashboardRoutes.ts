import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/dashboard/stats - Get aggregated stats for the dashboard
router.get("/stats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const roles = req.user?.roles || [];
    const isAdmin = roles.includes("ADMIN");
    const isManager = roles.includes("MANAGER");

    // Task filter remains the same: Admins/Managers see all, Viewers see assigned.
    const taskFilter = (isAdmin || isManager) ? {} : { assigneeId: userId };

    // Project count is now properly scoped for Managers.
    let projectWhereClause = {};
    if (isAdmin) {
      projectWhereClause = {}; // Admins see all
    } else if (isManager) {
      projectWhereClause = { ownerId: userId }; // Managers see their own
    } else {
      projectWhereClause = { tasks: { some: { assigneeId: userId } } }; // Viewers see assigned
    }

    const [taskStats, projectCount, userCount, totalTasks] = await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: taskFilter,
      }),
      prisma.project.count({
        where: projectWhereClause,
      }),
      prisma.user.count(),
      prisma.task.count({ where: taskFilter }),
    ]);

    // Calculate DONE percentage safely
    const doneCount =
      taskStats.find((s) => s.status === "DONE")?._count._all || 0;
    const completionRate =
      totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    res.json({
      totalProjects: projectCount,
      totalUsers: userCount,
      completionRate: completionRate, // FIX: This stops the NaN%
      tasksByStatus: {
        TODO: taskStats.find((s) => s.status === "TODO")?._count._all || 0,
        IN_PROGRESS:
          taskStats.find((s) => s.status === "IN_PROGRESS")?._count._all || 0,
        DONE: doneCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
