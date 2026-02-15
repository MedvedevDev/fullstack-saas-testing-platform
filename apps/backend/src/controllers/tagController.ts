import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(20),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
});

// GET /api/tags
export const getTags = async (req: AuthRequest, res: Response) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

// POST /api/tags
export const createTag = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = tagSchema.parse(req.body);

    const tag = await prisma.tag.create({ data: validatedData });

    await recordActivity(req.user!.userId, "TAG_CREATED", "TAG", tag.id);
    res.status(201).json(tag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Failed to create tag" });
  }
};

// PUT /api/tags/:id
export const updateTag = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const validatedData = tagSchema.partial().parse(req.body);

    const tag = await prisma.tag.update({
      where: { id },
      data: validatedData,
    });

    await recordActivity(req.user!.userId, "TAG_UPDATED", "TAG", tag.id);
    res.json(tag);
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
};

// DELETE /api/tags/:id
export const deleteTag = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.tag.delete({ where: { id } });

    await recordActivity(req.user!.userId, "TAG_DELETED", "TAG", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete tag" });
  }
};
