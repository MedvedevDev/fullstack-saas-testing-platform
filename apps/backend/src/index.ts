import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";

// Import Routers
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";

// Import Middleware
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { errorHandler } from "./middleware/errorMiddleware";
import { authenticateToken } from "./middleware/authMiddleware";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());

// --- Register modular routes
// Public Routes
app.use("/api/auth", authRoutes);
// Protected Routes - Require valid JWT
app.use("/api/projects", authenticateToken, projectRoutes);
app.use("/api/tasks", authenticateToken, taskRoutes);

app.use(errorHandler);

// Health check endpoint for CI/CD and automation pings
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
