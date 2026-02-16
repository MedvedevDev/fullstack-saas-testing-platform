import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../api/axios";

interface CreateProjectModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

const CreateProjectModal = ({
  onClose,
  onRefresh,
}: CreateProjectModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // In a real app, ownerId is usually handled by the backend via the auth token
      await api.post("/projects", formData);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-flow-border overflow-hidden">
        <div className="px-6 py-4 border-b border-flow-border flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-flow-text-main">New Project</h3>
          <button
            onClick={onClose}
            className="text-flow-text-muted hover:text-flow-text-main"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1 tracking-wider">
              Project Name
            </label>
            <input
              data-testid="project-name-input"
              required
              placeholder="e.g., Marketing Campaign"
              className="w-full p-2.5 border border-flow-border rounded-lg text-sm focus:ring-2 focus:ring-flow-blue/20 focus:border-flow-blue outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1 tracking-wider">
              Description (Optional)
            </label>
            <textarea
              data-testid="project-name-desc"
              placeholder="What is this project about?"
              rows={3}
              className="w-full p-2.5 border border-flow-border rounded-lg text-sm focus:ring-2 focus:ring-flow-blue/20 focus:border-flow-blue outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
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
              disabled={submitting}
              className="px-6 py-2 bg-flow-blue text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
