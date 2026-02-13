import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import api from "../api/axios";
import type { Task } from "../types/task";
import type { Project } from "../types/project";

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
}

const EditTaskModal = ({ task, onClose, onRefresh }: EditTaskModalProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with existing task data
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    projectId: task.projectId,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "",
  });

  useEffect(() => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Failed to load projects", err))
      .finally(() => setLoadingProjects(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // FIX: Strict validation prevents saving empty titles
    if (!formData.title.trim()) {
      alert("Task title cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/tasks/${task.id}`, {
        ...formData,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to update task", err);
      alert("Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-flow-border overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-flow-border flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-flow-text-main">Edit Task</h3>
          <button
            onClick={onClose}
            className="text-flow-text-muted hover:text-flow-text-main transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
              Title
            </label>
            <input
              required
              className="w-full p-2.5 border border-flow-border rounded-lg text-sm focus:ring-2 focus:ring-flow-blue/20 outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                Project
              </label>
              <select
                required
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm bg-white"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                disabled={loadingProjects}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                Status
              </label>
              <select
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm bg-white"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                Priority
              </label>
              <select
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm bg-white"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-flow-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-flow-text-muted hover:text-flow-text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-flow-blue text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
