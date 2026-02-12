import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    roles: string[];
  };
}

// Named export for authentication
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      roles: string[];
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Named export for role authorization
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (
      !req.user ||
      !req.user.roles.some((role) => allowedRoles.includes(role))
    ) {
      return res.status(403).json({ error: "Permission denied" });
    }
    next();
  };
};
