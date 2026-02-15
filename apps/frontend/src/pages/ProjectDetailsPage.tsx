import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "../api/axios";
import type { Task } from "../types/task";
import type { User } from "../types/user";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal"; // NEW IMPORT

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

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // NEW

  const [canManage, setCanManage] = useState(false);

  // Fetch Project Data (Moved to reusable function)
  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      console.error("Failed to fetch project", err);
      if (!project) navigate("/projects"); // Only redirect if initial load fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user: User = JSON.parse(userStr);
      const hasPermission = user.roles.some(
        (r) => r.name === "ADMIN" || r.name === "MANAGER",
      );
      setCanManage(hasPermission);
    }
    fetchProject();
  }, [id]);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject(); // Refresh list
    } catch (err) {
      alert("Failed to delete task");
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
      <div className="p-10 text-center text-flow-text-muted">Loading...</div>
    );
  if (!project) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm text-flow-text-muted hover:text-flow-text-main mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-flow-text-main">
                {project.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${project.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-flow-text-muted max-w-2xl">
              {project.description || "No description provided."}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-flow-text-muted uppercase mb-1">
              Created
            </div>
            <div className="flex items-center gap-2 text-sm text-flow-text-main">
              <Calendar className="h-4 w-4 text-flow-blue" />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white border border-flow-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-flow-border bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-flow-text-main">
            Project Tasks ({project.tasks.length})
          </h3>
          {canManage && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-flow-blue text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 text-sm active:scale-95"
            >
              <Plus className="h-4 w-4" /> Create Task
            </button>
          )}
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-flow-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                Task
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                Priority
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                Assigned To
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                Due Date
              </th>
              {canManage && (
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-flow-text-muted">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-flow-border">
            {project.tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-flow-text-muted"
                >
                  No tasks yet.
                </td>
              </tr>
            ) : (
              project.tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-flow-text-main">
                    {task.title}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                      {getStatusIcon(task.status)}{" "}
                      {task.status.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
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
                  <td className="px-6 py-4 text-sm">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          {task.assignee.firstName[0]}
                          {task.assignee.lastName[0]}
                        </div>
                        <span className="text-flow-text-main">
                          {task.assignee.firstName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-flow-text-muted">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No date"}
                  </td>

                  {/* Action Buttons (Edit/Delete) */}
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 text-gray-400 hover:text-flow-blue hover:bg-blue-50 rounded"
                          title="Edit Task"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
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

      {/* Add Edit Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onRefresh={fetchProject}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;
