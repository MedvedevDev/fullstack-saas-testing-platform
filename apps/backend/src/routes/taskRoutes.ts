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

// Task Schema matches your Prisma enums and relations
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  projectId: z.string().uuid("Invalid Project ID"),
  assigneeId: z.string().uuid("Invalid User ID").optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
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

      await recordActivity(req.user!.userId, `TASK_CREATED: ${task.title}`);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  },
);

// PUT /api/tasks/:id - Update task (status, priority, or assignee)
router.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string; // Cast to satisfy strict types
    const validatedData = taskSchema.partial().parse(req.body); // Allow partial updates

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate
          ? new Date(validatedData.dueDate)
          : undefined,
      },
    });

    await recordActivity(req.user!.userId, `TASK_UPDATED: ${task.title}`);
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(400).json({ error: "Update failed" });
  }
});

export default router;
