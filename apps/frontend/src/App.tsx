import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import TasksPage from "./pages/TasksPage";
import ProjectsPage from "./pages/ProjectsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* Default dashboard view */}
          <Route
            path="/dashboard"
            element={
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-flow-text-main">
                  Dashboard Overview
                </h2>
                <p className="text-flow-text-muted">
                  Welcome to your workspace.
                </p>
              </div>
            }
          />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route
            path="/users"
            element={
              <div className="text-2xl font-bold text-flow-text-main">
                Team Members
              </div>
            }
          />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all: redirect to dashboard if logged in (handled by logic later) or login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
