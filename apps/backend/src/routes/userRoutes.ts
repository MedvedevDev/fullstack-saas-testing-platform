import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { AuthRequest } from "../middleware/authMiddleware";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/users/me - Get current logged in user profile and roles
router.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    // req.user comes from the authenticateToken middleware we built
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: { select: { name: true } }, // Fetch roles for UI visibility logic
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
