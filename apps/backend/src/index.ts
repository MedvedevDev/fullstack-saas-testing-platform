import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";

// Import Routers
import logRoutes from "./routes/logRoutes";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import userRoutes from "./routes/userRoutes";
import tagRoutes from "./routes/tagRoutes";
import commentRoutes from "./routes/commentRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

// Import Middleware
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { errorHandler } from "./middleware/errorMiddleware";
// Note: authenticateToken is no longer needed here since it's inside the routes

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());

// --- Register modular routes ---

// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes
// (Auth logic is now handled INSIDE these files for better modularity)
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// *CRITICAL*: Ensure logRoutes has auth inside it (see step 2 below)
app.use("/api/logs", logRoutes);

app.use(errorHandler);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
