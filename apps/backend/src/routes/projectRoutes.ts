import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Required for Prisma 7
import { Pool } from "pg"; // Required for Prisma 7

const router = Router();

// Setup the Prisma 7 connection with the pg adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/projects - List projects with owner details and task counts
router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: { firstName: true, lastName: true, email: true }, // Pulling User details
        },
        _count: {
          select: { tasks: true }, // Relation testing: counting tasks per project [cite: 155]
        },
      },
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

export default router;
