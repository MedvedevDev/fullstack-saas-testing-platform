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

// Task Schema ensuring data integrity for your Senior QA testing
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  projectId: z.string().uuid("Invalid Project ID"),
  assigneeId: z.string().uuid("Invalid User ID").optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string().uuid()).optional(), // Array of Tag IDs
});

// GET /api/tasks - Fetch tasks with advanced filtering
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, priority, assigneeId, projectId, search } = req.query;

    // Build dynamic filter object
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;

    // Add basic text search on title if provided
    if (search) {
      where.title = {
        contains: search as string,
        mode: "insensitive",
      };
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
});

// POST /api/tasks - Create a task and assign to a user
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res) => {
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
          dueDate: validatedData.dueDate
            ? new Date(validatedData.dueDate)
            : null,
        },
      });

      // Automatically record activity for audit trail
      await recordActivity(req.user!.userId, `TASK_CREATED: ${task.title}`);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues }); // Return specific validation issues
      }
      console.error("TASK_CREATE_ERROR:", error); // This will tell you if it's a "Foreign key constraint failed"
      res.status(500).json({ error: "Failed to create task", details: error });
    }
  },
);

// PUT /api/tasks/:id - Update task details or assignment
router.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { tags, ...rest } = taskSchema.partial().parse(req.body);

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
        // Many-to-Many connection logic
        tags: tags
          ? {
              set: tags.map((tagId) => ({ id: tagId })), // Overwrites existing tags with new list
            }
          : undefined,
      },
      include: { tags: true }, // Return the updated tags in the response
    });

    await recordActivity(
      req.user!.userId,
      `TASK_UPDATED: ${task.title} (Tags modified)`,
    );
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(400).json({ error: "Update failed" });
  }
});

// DELETE /api/tasks/:id - Remove a task and log the action
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;

      // We fetch the task first to get the title for a better log message
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) return res.status(404).json({ error: "Task not found" });

      await prisma.task.delete({
        where: { id },
      });

      await recordActivity(req.user!.userId, `TASK_DELETED: ${task.title}`);
      res.status(204).send(); // 204 No Content is standard for successful deletion
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  },
);

export default router;
