import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger"; // Ensure this is imported
import { z } from "zod";
import { prisma } from "../lib/prisma";

// Validation Schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  projectId: z.string().optional(), // Make optional for updates
  assigneeId: z.string().uuid("Invalid User ID").optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// GET /api/tasks
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const roles = req.user?.roles || [];
    const isViewer = !roles.includes("ADMIN") && !roles.includes("MANAGER");

    const query: any = {
      include: {
        project: { select: { name: true } },
        assignee: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    };

    // If user is just a VIEWER, only show tasks assigned to THEM
    if (isViewer) {
      query.where = { assigneeId: req.user?.userId };
    }

    const tasks = await prisma.task.findMany(query);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// POST /api/tasks
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    // For create, we might want a stricter schema, but using the same one for simplicity
    // forcing title/projectId existence usually happens in Zod or manually here
    const body = req.body;
    if (!body.title || !body.projectId) {
      return res
        .status(400)
        .json({ error: "Title and Project ID are required" });
    }

    const validatedData = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: validatedData.title!,
        description: validatedData.description,
        status: validatedData.status || "TODO",
        priority: validatedData.priority || "MEDIUM",
        projectId: validatedData.projectId!,
        assigneeId: validatedData.assigneeId,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
    });

    await recordActivity(req.user!.userId, "TASK_CREATED", "TASK", task.id);
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
  const id = req.params.id as string;

  try {
    const validatedData = taskSchema.parse(req.body);

    // 1. Fetch current task to compare changes
    const currentTask = await prisma.task.findUnique({ where: { id } });
    if (!currentTask) return res.status(404).json({ error: "Task not found" });

    const userRoles = req.user?.roles || [];
    const isAdminOrManager =
      userRoles.includes("ADMIN") || userRoles.includes("MANAGER");
    const isAssignee = currentTask.assigneeId === req.user?.userId;

    if (!isAdminOrManager && !isAssignee) {
      return res
        .status(403)
        .json({ error: "You can only update tasks assigned to you" });
    }

    // 2. Perform Update
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: validatedData.title,
        status: validatedData.status,
        priority: validatedData.priority,
        description: validatedData.description,
        dueDate: validatedData.dueDate
          ? new Date(validatedData.dueDate)
          : undefined,
        projectId: validatedData.projectId,
        assigneeId: validatedData.assigneeId,
        tags: validatedData.tags
          ? { set: validatedData.tags.map((tagId) => ({ id: tagId })) }
          : undefined,
      },
    });

    // 3. DETAILED LOGGING (Global Requirement #1)
    if (validatedData.status && validatedData.status !== currentTask.status) {
      await recordActivity(
        req.user!.userId,
        `Changed status to ${validatedData.status}`,
        "TASK",
        id,
      );
    }

    if (
      validatedData.priority &&
      validatedData.priority !== currentTask.priority
    ) {
      await recordActivity(
        req.user!.userId,
        `Changed priority to ${validatedData.priority}`,
        "TASK",
        id,
      );
    }

    // Fallback log if just editing details (title, desc)
    if (!validatedData.status && !validatedData.priority) {
      await recordActivity(
        req.user!.userId,
        "Updated task details",
        "TASK",
        id,
      );
    }

    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Failed to update task" });
  }
};

// DELETE /api/tasks/:id (This was missing!)
export const deleteTask = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Middleware 'write:tasks' handles role check (Admin/Manager),
    // but strict safety suggests we assume RBAC middleware did its job.

    await prisma.task.delete({ where: { id } });

    await recordActivity(req.user!.userId, "TASK_DELETED", "TASK", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};
