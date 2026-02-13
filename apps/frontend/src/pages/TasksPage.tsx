import { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "../api/axios";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import type { Task } from "../types/task";

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-flow-text-main">Tasks</h2>
          <p className="text-sm text-flow-text-muted">
            Tracking all activities and deadlines
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-flow-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </button>
      </div>

      <div className="bg-white border border-flow-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-flow-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Task Details
              </th>
              {/* FIX: Added whitespace-nowrap to headers as well for consistency */}
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Priority
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted whitespace-nowrap">
                Due Date
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted whitespace-nowrap">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-flow-border">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-flow-text-muted"
                >
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-flow-text-muted"
                >
                  No tasks found.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-flow-text-main group-hover:text-flow-blue transition-colors">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wide whitespace-nowrap">
                        {task.project?.name || "No Project"}
                      </span>
                    </div>
                  </td>

                  {/* FIX: Added whitespace-nowrap to prevent "IN PROGRESS" from wrapping */}
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

                  {/* FIX: Added whitespace-nowrap to prevent "No date" from wrapping */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-flow-text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-flow-text-muted whitespace-nowrap">
                    {formatDate(task.createdAt)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 text-gray-400 hover:text-flow-blue hover:bg-blue-50 rounded transition-colors"
                        title="Edit Task"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
          onRefresh={fetchTasks}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  );
};

export default TasksPage;
