import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = projectSchema.parse(req.body);

    // Now uses the shared 'prisma' instance
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        ownerId: req.user!.userId,
      },
    });

    await recordActivity(req.user!.userId, `PROJECT_CREATED: ${project.name}`);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user!.userId },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const validatedData = projectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
    });

    await recordActivity(req.user!.userId, `PROJECT_UPDATED: ${project.name}`);
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(400).json({ error: "Update failed or project not found" });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await prisma.$transaction([
      prisma.task.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);

    await recordActivity(req.user!.userId, `PROJECT_DELETED: ${project.name}`);
    res.status(204).send();
  } catch (error) {
    console.error("Delete failed", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    // FIX: Explicitly cast 'id' as a string to satisfy TypeScript/Prisma
    const id = req.params.id as string;

    // Optional: Safety check if you want to be extra safe
    if (!id) return res.status(400).json({ error: "Project ID is required" });

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ error: "Failed to fetch project details" });
  }
};
