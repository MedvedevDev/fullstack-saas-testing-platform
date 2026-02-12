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

const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(20),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
});

// POST /api/tags - Create a new global tag
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res) => {
    try {
      const validatedData = tagSchema.parse(req.body);

      const tag = await prisma.tag.create({
        data: validatedData,
      });

      await recordActivity(req.user!.userId, `TAG_CREATED: ${tag.name}`);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: "Failed to create tag" });
    }
  },
);

// GET /api/tags - List all available tags
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// PUT /api/tags/:id - Update tag properties
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const validatedData = tagSchema.partial().parse(req.body);

      const tag = await prisma.tag.update({
        where: { id },
        data: validatedData,
      });

      await recordActivity(req.user!.userId, `TAG_UPDATED: ${tag.name}`);
      res.json(tag);
    } catch (error) {
      res.status(400).json({ error: "Update failed" });
    }
  },
);

// DELETE /api/tags/:id - Remove a tag globally
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      await prisma.tag.delete({ where: { id } });

      await recordActivity(req.user!.userId, `TAG_DELETED: ${id}`);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tag" });
    }
  },
);

export default router;
