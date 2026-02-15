import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import api from "../api/axios";
import type { Task } from "../types/task";
import CreateTaskModal from "../components/CreateTaskModal";
import type { User } from "../types/user";

// Define a local type that includes tasks
interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  tasks: Task[];
}

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    // 1. Check Permissions
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user: User = JSON.parse(userStr);
      // Check if user is Admin or Manager
      const hasPermission = user.roles.some(
        (r) => r.name === "ADMIN" || r.name === "MANAGER",
      );
      setCanManage(hasPermission);
    }

    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        console.error("Failed to fetch project", err);
        navigate("/projects"); // Redirect if not found
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      console.error("Failed to fetch project", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-flow-text-muted">
        Loading project...
      </div>
    );
  if (!project) return null;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm text-flow-text-muted hover:text-flow-text-main mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-flow-text-main">
                {project.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  project.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-flow-text-muted max-w-2xl">
              {project.description || "No description provided."}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-flow-text-muted uppercase tracking-wider mb-1">
              Created
            </div>
            <div className="flex items-center gap-2 text-sm text-flow-text-main">
              <Calendar className="h-4 w-4 text-flow-blue" />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List Section */}
      <div className="bg-white border border-flow-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-flow-border bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-flow-text-main">
            Project Tasks ({project.tasks.length})
          </h3>

          {/* FIX: Only show Create button if user is Admin or Manager */}
          {canManage && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-flow-blue text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 text-sm transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )}
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-flow-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Task
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Priority
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-flow-border">
            {project.tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-flow-text-muted"
                >
                  No tasks in this project yet.
                </td>
              </tr>
            ) : (
              project.tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-flow-text-main">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-flow-text-main uppercase">
                      {getStatusIcon(task.status)}
                      {task.status.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${
                        task.priority === "HIGH"
                          ? "bg-red-50 text-red-600"
                          : task.priority === "MEDIUM"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-green-50 text-green-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-flow-text-muted">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No date"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onRefresh={fetchProject}
          projectId={id}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;
