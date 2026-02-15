import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { recordActivity } from "../utils/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

//  Validation schema for creating a user
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "MANAGER", "VIEWER"]),
});

//  Admin Create User
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const { email, password, firstName, lastName, role } = validatedData;

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Find Role ID
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // 4. Create User & Connect Role
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        roles: {
          connect: { id: roleRecord.id },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: { select: { name: true } },
        createdAt: true,
      },
    });

    await recordActivity(
      req.user!.userId,
      `Created user ${email} as ${role}`,
      "USER",
      newUser.id,
    );
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// GET /api/users/me
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: { select: { name: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// GET /api/users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // 1. Prevent deleting yourself
    if (id === req.user?.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account." });
    }

    // 2. SAFETY CHECK: Do they own projects?
    const projectCount = await prisma.project.count({ where: { ownerId: id } });
    if (projectCount > 0) {
      return res.status(400).json({
        error: `Cannot delete user: They own ${projectCount} active projects. Please delete or reassign them first.`,
      });
    }

    // 3. SAFETY CHECK: Are they assigned to tasks?
    const taskCount = await prisma.task.count({ where: { assigneeId: id } });
    if (taskCount > 0) {
      return res.status(400).json({
        error: `Cannot delete user: They are assigned to ${taskCount} active tasks. Please unassign them first.`,
      });
    }

    // 4. Clean up logs and delete user
    // We delete logs first because they are safe to remove
    await prisma.activityLog.deleteMany({ where: { userId: id } });

    const deletedUser = await prisma.user.delete({ where: { id } });

    await recordActivity(
      req.user!.userId,
      "USER_DELETED",
      "USER",
      deletedUser.id,
    );
    res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// PUT /api/users/me
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, password } = req.body;

    // Prepare the data object
    const updateData: any = {
      firstName,
      lastName,
    };

    // If a new password is sent, hash it before saving
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: { select: { name: true } },
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
