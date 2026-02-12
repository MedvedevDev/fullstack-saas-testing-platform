import express from "express";
import cors from "cors"; //
import * as dotenv from "dotenv"; //
import path from "path";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Register modular routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Health check endpoint for CI/CD and automation pings [cite: 79]
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
