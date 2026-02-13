import { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";
import api from "../api/axios";
import type { Task } from "../types/task"; // Added 'type' keyword here

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks");
        setTasks(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-flow-text-muted" />;
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
        <button className="flex items-center gap-2 bg-flow-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm">
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
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Priority
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Due Date
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Created
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-flow-border">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-flow-text-muted"
                >
                  Loading...
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-flow-text-main">
                      {task.title}
                    </div>
                    <div className="text-xs text-flow-text-muted">
                      ID: {task.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-flow-text-main uppercase">
                      {getStatusIcon(task.status)}
                      {task.status}
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-flow-text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-flow-text-muted">
                    {formatDate(task.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-flow-text-muted hover:text-flow-indigo">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksPage;
