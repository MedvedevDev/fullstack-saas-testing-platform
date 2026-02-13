import React, { useState } from "react";
import api from "../api/axios";

const CreateTaskModal = ({
  onClose,
  onRefresh,
}: {
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "", // Required by schema [cite: 4]
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure we send the date in ISO format or null
      const payload = {
        ...formData,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
      };
      await api.post("/tasks", payload);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Creation failed", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-flow-border">
          <h3 className="text-lg font-bold text-flow-text-main">New Task</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
              Title
            </label>
            <input
              required
              className="w-full p-2 border border-flow-border rounded-lg"
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
                className="w-full p-2 border border-flow-border rounded-lg"
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
                className="w-full p-2 border border-flow-border rounded-lg"
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
              className="px-4 py-2 text-sm text-flow-text-muted font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-flow-blue text-white rounded-lg font-bold text-sm"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
