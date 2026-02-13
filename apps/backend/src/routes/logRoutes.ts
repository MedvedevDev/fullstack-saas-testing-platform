import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
// Import authenticateToken here
import {
  AuthRequest,
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import * as dotenv from "dotenv";

dotenv.config();

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ADD THIS: Global protection for logs
router.use(authenticateToken);

// GET /api/logs
router.get(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const logs = await prisma.activityLog.findMany({
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  },
);

export default router;
