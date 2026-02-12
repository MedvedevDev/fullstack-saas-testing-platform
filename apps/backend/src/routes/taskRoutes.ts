import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Required for Prisma 7
import { Pool } from "pg"; //

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/tasks - Includes Pagination and Filtering [cite: 31, 32]
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        take: Number(limit),
        skip: skip,
        include: {
          project: { select: { name: true } },
          assignee: { select: { firstName: true, lastName: true } },
        },
        // Now 'createdAt' is a known property
        orderBy: { [sortBy as string]: sortOrder as "asc" | "desc" },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      data: tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

export default router;
