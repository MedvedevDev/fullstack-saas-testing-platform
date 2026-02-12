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
    // Run multiple aggregations in parallel for better performance
    const [taskStats, projectCount, userCount] = await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.project.count(),
      prisma.user.count(),
    ]);

    // Format the stats for the frontend charts
    const stats = {
      totalProjects: projectCount,
      totalUsers: userCount,
      tasksByStatus: taskStats.reduce((acc: any, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      }, {}),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
