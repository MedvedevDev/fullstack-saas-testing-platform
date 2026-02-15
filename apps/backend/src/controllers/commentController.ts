import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";
import { z } from "zod";

// Basic schema for creating/updating a comment
const commentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
  taskId: z.string().uuid("Invalid task ID"),
});

/**
 * Get all comments for a specific task
 */
export const getCommentsForTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

/**
 * Create a new comment on a task
 */
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = commentSchema.parse(req.body);
    const authorId = req.user!.userId;

    // TODO: Verify that the user has access to the task they are commenting on

    const newComment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        taskId: validatedData.taskId,
        authorId: authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Create an activity log for the comment
    await recordActivity(
      authorId,
      "COMMENT_CREATED",
      "COMMENT",
      newComment.id
    );
    res.status(201).json(newComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Failed to create comment" });
  }
};

/**
 * Update an existing comment
 */
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    const user = req.user!;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const canModify =
      user.roles.includes("ADMIN") ||
      user.roles.includes("MANAGER") ||
      comment.authorId === user.userId;

    if (!canModify) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this comment" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    await recordActivity(
      user.userId,
      "COMMENT_UPDATED",
      "COMMENT",
      updatedComment.id
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;
    const user = req.user!;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const canModify =
      user.roles.includes("ADMIN") ||
      user.roles.includes("MANAGER") ||
      comment.authorId === user.userId;

    if (!canModify) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    await recordActivity(user.userId, "COMMENT_DELETED", "COMMENT", commentId);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
