import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../api/axios";
import type { Project } from "../types/project";

interface CreateTaskModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

const CreateTaskModal = ({ onClose, onRefresh }: CreateTaskModalProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  // Fetch projects to populate the dropdown
  useEffect(() => {
    api
      .get("/projects")
      .then((res) => {
        setProjects(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, projectId: res.data[0].id }));
        }
      })
      .finally(() => setLoadingProjects(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/tasks", {
        ...formData,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-flow-border overflow-hidden">
        <div className="px-6 py-4 border-b border-flow-border flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-flow-text-main">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-flow-text-muted hover:text-flow-text-main"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
              Project
            </label>
            <select
              required
              className="w-full p-2.5 border border-flow-border rounded-lg bg-white text-sm"
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
              disabled={loadingProjects}
            >
              {loadingProjects ? (
                <option>Loading projects...</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
              Title
            </label>
            <input
              required
              placeholder="What needs to be done?"
              className="w-full p-2.5 border border-flow-border rounded-lg text-sm"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
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
                  setFormData({ ...formData, priority: e.target.value })
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

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-flow-text-muted hover:text-flow-text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingProjects}
              className="px-6 py-2 bg-flow-blue text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
