import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { z } from "zod";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(), // Matches schema
});

// POST /api/projects
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res) => {
    try {
      const validatedData = projectSchema.parse(req.body);

      const project = await prisma.project.create({
        data: {
          ...validatedData,
          ownerId: req.user!.userId,
        },
      });

      await recordActivity(
        req.user!.userId,
        `PROJECT_CREATED: ${project.name}`,
      );
      res.status(201).json(project);
    } catch (error) {
      // FIX 1: Access .issues instead of .errors for Zod
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  },
);

// PUT /api/projects/:id
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res) => {
    try {
      // FIX 2: Ensure ID is a string (casting) to satisfy Prisma
      const id = req.params.id as string;
      const validatedData = projectSchema.parse(req.body);

      const project = await prisma.project.update({
        where: { id },
        data: validatedData,
      });

      await recordActivity(
        req.user!.userId,
        `PROJECT_UPDATED: ${project.name}`,
      );
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(400).json({ error: "Update failed" });
    }
  },
);

// DELETE /api/projects/:id - Remove a project and its associated tasks
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;

      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Transaction ensures both the project and its tasks are deleted safely
      await prisma.$transaction([
        prisma.task.deleteMany({ where: { projectId: id } }),
        prisma.project.delete({ where: { id } }),
      ]);

      await recordActivity(
        req.user!.userId,
        `PROJECT_DELETED: ${project.name}`,
      );
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  },
);

export default router;
