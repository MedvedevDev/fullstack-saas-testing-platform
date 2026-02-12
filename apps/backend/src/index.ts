import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Add this
import { Pool } from "pg"; // Add this
import * as dotenv from "dotenv";
import path from "path";

// 1. Explicitly load env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

// 2. Setup the Pool and Adapter for Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GET Dashboard Stats
app.get("/api/stats", async (req, res) => {
  try {
    const [userCount, projectCount, taskCount] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
    ]);

    res.json({
      users: userCount,
      projects: projectCount,
      tasks: taskCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET All Tasks (with basic pagination)
app.get("/api/tasks", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const tasks = await prisma.task.findMany({
      take: Number(limit),
      skip: skip,
      include: {
        project: { select: { name: true } }, // Join with project to get the name
      },
      orderBy: { id: "asc" },
    });

    res.json({
      page: Number(page),
      limit: Number(limit),
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
