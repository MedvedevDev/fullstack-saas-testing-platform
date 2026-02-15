import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  ownerId: z.string().uuid().optional(),
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

    await recordActivity(
      req.user!.userId,
      "PROJECT_CREATED",
      "PROJECT",
      project.id,
    );
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
    const userId = req.user?.userId;
    const roles = req.user?.roles || [];

    // Check if user is Admin or Manager
    const canViewAll = roles.includes("ADMIN") || roles.includes("MANAGER");

    let whereClause: any = {};

    if (!canViewAll) {
      // STRICT FILTER: Viewers only see projects where they have a task assigned.
      whereClause = {
        tasks: {
          some: {
            assigneeId: userId,
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const validatedData = projectSchema.parse(req.body);
    const userRoles = req.user?.roles || [];
    const isAdmin = userRoles.includes("ADMIN");

    // 1. Fetch current project
    const currentProject = await prisma.project.findUnique({ where: { id } });
    if (!currentProject)
      return res.status(404).json({ error: "Project not found" });

    // 2. Prepare update data
    const updateData: any = {
      name: validatedData.name,
      description: validatedData.description,
      status: validatedData.status,
    };

    // 3. Handle Owner Reassignment (Admin Only)
    if (
      validatedData.ownerId &&
      validatedData.ownerId !== currentProject.ownerId
    ) {
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: "Only Admins can reassign project ownership" });
      }
      updateData.ownerId = validatedData.ownerId;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    await recordActivity(
      req.user!.userId,
      "PROJECT_UPDATED",
      "PROJECT",
      project.id,
    );
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

    await recordActivity(req.user!.userId, "PROJECT_DELETED", "PROJECT", id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete failed", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Authorization Check
    const isManagerOrAdmin =
      user.roles.includes("ADMIN") || user.roles.includes("MANAGER");

    if (!isManagerOrAdmin) {
      const isAssignedToProject = await prisma.task.count({
        where: {
          projectId: id,
          assigneeId: user.userId,
        },
      });

      if (isAssignedToProject === 0) {
        // Return 404 to prevent leaking that the project exists
        return res.status(404).json({ error: "Project not found" });
      }
    }

    res.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ error: "Failed to fetch project details" });
  }
};
