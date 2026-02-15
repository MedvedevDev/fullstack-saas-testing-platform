import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Global protection for logs
router.use(authenticateToken);

// GET /api/logs
// FIX: Removed strict authorizeRoles("ADMIN", "MANAGER") wrapper
// We now handle permission logic inside the route
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const roles = req.user?.roles || [];

    // Check if user is strictly a Viewer (not Admin/Manager)
    const isViewer = !roles.includes("ADMIN") && !roles.includes("MANAGER");

    let whereClause = {};

    if (isViewer) {
      // FIX: Viewers only see their OWN activity logs.
      // (Since schema doesn't link logs to projects, this is the safest filter)
      whereClause = { userId: userId };
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
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
});

export default router;
