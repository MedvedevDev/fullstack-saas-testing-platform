import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";
import { z } from "zod";
import { prisma } from "../lib/prisma";

// Validation Schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  projectId: z.string().uuid("Invalid Project ID"),
  assigneeId: z.string().uuid("Invalid User ID").optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string().uuid()).optional(),
});

// GET /api/tasks
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, assigneeId, projectId, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.title = { contains: search as string, mode: "insensitive" };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { firstName: true, lastName: true } },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// POST /api/tasks
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = taskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status || "TODO",
        priority: validatedData.priority || "MEDIUM",
        projectId: validatedData.projectId,
        assigneeId: validatedData.assigneeId,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
    });

    await recordActivity(req.user!.userId, `TASK_CREATED: ${task.title}`);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Failed to create task" });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { tags, ...rest } = taskSchema.partial().parse(req.body);

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
        tags: tags ? { set: tags.map((tagId) => ({ id: tagId })) } : undefined,
      },
      include: { tags: true },
    });

    await recordActivity(req.user!.userId, `TASK_UPDATED: ${task.title}`);
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(400).json({ error: "Update failed" });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    await prisma.task.delete({ where: { id } });

    await recordActivity(req.user!.userId, `TASK_DELETED: ${task.title}`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};
