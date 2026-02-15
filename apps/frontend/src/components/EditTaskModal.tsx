import React, { useState, useEffect } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import api from "../api/axios";
import type { Task } from "../types/task";
import type { User } from "../types/user";

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
}

const EditTaskModal = ({ task, onClose, onRefresh }: EditTaskModalProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : "",
  );
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put(`/tasks/${task.id}`, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        projectId: task.projectId,
        assigneeId: assigneeId || null,
      });
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Assignee
            </label>
            <select
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Status
              </label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={status}
                // FIX: Type assertion here
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Priority
              </label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={priority}
                // FIX: Type assertion here
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
