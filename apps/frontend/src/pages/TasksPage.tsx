import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  Filter,
  ListFilter,
} from "lucide-react";
import api from "../api/axios";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import type { Task } from "../types/task";
import type { User } from "../types/user";

type SortConfig = {
  key: keyof Task | "project" | "assignee";
  direction: "asc" | "desc";
} | null;

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState("");

  // Dropdown States
  const [statusDropdown, setStatusDropdown] = useState("");
  const [priorityDropdown, setPriorityDropdown] = useState("");

  // Checkbox States (Multi-select)
  const [statusCheckboxes, setStatusCheckboxes] = useState<string[]>([]);
  const [priorityCheckboxes, setPriorityCheckboxes] = useState<string[]>([]);

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchTasks();
  }, []);

  // --- HANDLERS ---

  const toggleStatusCheckbox = (status: string) => {
    setStatusCheckboxes((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const togglePriorityCheckbox = (priority: string) => {
    setPriorityCheckboxes((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority],
    );
  };

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = [...tasks];

    // 1. Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(lower) ||
          task.project?.name.toLowerCase().includes(lower) ||
          (task.assignee &&
            `${task.assignee.firstName} ${task.assignee.lastName}`
              .toLowerCase()
              .includes(lower)),
      );
    }

    // 2. Dropdown Filters
    if (statusDropdown) {
      result = result.filter((task) => task.status === statusDropdown);
    }
    if (priorityDropdown) {
      result = result.filter((task) => task.priority === priorityDropdown);
    }

    // 3. Checkbox Filters (If any selected, match ANY of them)
    if (statusCheckboxes.length > 0) {
      result = result.filter((task) => statusCheckboxes.includes(task.status));
    }
    if (priorityCheckboxes.length > 0) {
      result = result.filter((task) =>
        priorityCheckboxes.includes(task.priority),
      );
    }

    // 4. Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Task];
        let bValue: any = b[sortConfig.key as keyof Task];

        if (sortConfig.key === "project") {
          aValue = a.project?.name || "";
          bValue = b.project?.name || "";
        } else if (sortConfig.key === "assignee") {
          aValue = a.assignee ? a.assignee.firstName : "";
          bValue = b.assignee ? b.assignee.firstName : "";
        }

        if (sortConfig.key === "priority") {
          const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue = priorityWeight[a.priority as keyof typeof priorityWeight];
          bValue = priorityWeight[b.priority as keyof typeof priorityWeight];
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredTasks(result);
  }, [
    searchTerm,
    statusDropdown,
    priorityDropdown,
    statusCheckboxes,
    priorityCheckboxes,
    sortConfig,
    tasks,
  ]);

  const handleSort = (key: keyof Task | "project" | "assignee") => {
    setSortConfig((current) => {
      if (current?.key === key && current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  const canManage = currentUser?.roles.some(
    (r) => r.name === "ADMIN" || r.name === "MANAGER",
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
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
        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-flow-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" /> Create Task
          </button>
        )}
      </div>

      {/* --- FILTER SECTION --- */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, projects, assignees..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dropdown Filters */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <ListFilter className="h-4 w-4" /> Dropdown Filters
            </h3>
            <div className="flex gap-4">
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
                value={statusDropdown}
                onChange={(e) => setStatusDropdown(e.target.value)}
              >
                <option value="">Any Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>

              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
                value={priorityDropdown}
                onChange={(e) => setPriorityDropdown(e.target.value)}
              >
                <option value="">Any Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Checkbox Filters */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Filter className="h-4 w-4" /> Checkbox Filters
            </h3>

            <div className="flex flex-col gap-3">
              {/* Priority Checkboxes */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                  Priority:
                </span>
                {["HIGH", "MEDIUM", "LOW"].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={priorityCheckboxes.includes(p)}
                      onChange={() => togglePriorityCheckbox(p)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {p.toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>

              {/* Status Checkboxes */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                  Status:
                </span>
                {[
                  { val: "TODO", lbl: "To Do" },
                  { val: "IN_PROGRESS", lbl: "In Progress" },
                  { val: "DONE", lbl: "Done" },
                ].map((s) => (
                  <label
                    key={s.val}
                    className="flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={statusCheckboxes.includes(s.val)}
                      onChange={() => toggleStatusCheckbox(s.val)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-600">
                      {s.lbl}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-flow-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-flow-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                Task Details
              </th>

              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted whitespace-nowrap cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>

              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center gap-1">
                  Priority <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>

              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted whitespace-nowrap cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("dueDate")}
              >
                <div className="flex items-center gap-1">
                  Due Date <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>

              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-flow-text-muted whitespace-nowrap cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Created <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>

              {canManage && (
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-flow-text-muted">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-flow-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  No tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-flow-text-main group-hover:text-flow-blue">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                        {task.project?.name || "No Project"}
                      </span>
                      {task.assignee && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">
                          {task.assignee.firstName}
                        </span>
                      )}
                    </div>
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
                  <td className="px-6 py-4 text-sm text-flow-text-muted whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-flow-text-muted whitespace-nowrap">
                    {formatDate(task.createdAt)}
                  </td>

                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      {/* Actions always visible, slightly dimmed, full color on hover */}
                      <div className="flex justify-end gap-2">
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
