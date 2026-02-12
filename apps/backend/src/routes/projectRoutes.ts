import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";

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
          select: { tasks: true }, // Relation testing: counting tasks per project
        },
      },
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST /api/projects - Only ADMIN or MANAGER can create projects
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req, res) => {
    try {
      const { name, description, ownerId } = req.body;
      const project = await prisma.project.create({
        data: { name, description, ownerId },
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Failed to create project" });
    }
  },
);

export default router;
