import { useState, useEffect } from "react";
import {
  Mail,
  Shield,
  Trash2,
  User as UserIcon,
  Search,
  AlertTriangle,
  Plus,
  Briefcase, // Icon for Manager
} from "lucide-react";
import api from "../api/axios";
import type { User } from "../types/user";
import CreateUserModal from "../components/CreateUserModal";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      setError("");
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      if (err.response?.status === 403) {
        setError(
          "Access Denied: You need ADMIN or MANAGER permissions to view this list.",
        );
      } else {
        setError("Failed to load team members. Please check backend logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const roleName = user.roles?.[0]?.name || "";
        setCurrentUserRole(roleName);
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
  }, []);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully.");
    } catch (err: any) {
      console.error("Delete error:", err);
      const message = err.response?.data?.error || "Failed to delete user.";
      alert(message);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const getRoleBadge = (roles: any[]) => {
    if (roles.some((r) => r.name === "ADMIN")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-200">
          <Shield className="h-3 w-3" /> ADMIN
        </span>
      );
    }
    if (roles.some((r) => r.name === "MANAGER")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200">
          <Briefcase className="h-3 w-3" /> MANAGER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border bg-slate-50 text-slate-600 border-slate-200">
        <UserIcon className="h-3 w-3" /> VIEWER
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-flow-text-main">
            Team Members
          </h2>
          <p className="text-sm text-flow-text-muted">
            Manage access and roles
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              aria-label="Search users"
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 border border-flow-border rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-flow-blue/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {currentUserRole === "ADMIN" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-flow-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="bg-white border border-flow-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-flow-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                User
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted">
                Joined
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-flow-text-muted text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-flow-border">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-flow-text-muted"
                >
                  Loading team...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-flow-text-muted"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isAdmin = user.roles.some((r) => r.name === "ADMIN");
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAdmin ? "bg-indigo-500" : "bg-flow-blue"}`}
                        >
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-flow-text-main">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-flow-text-muted flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX: Correct Role Badge Logic */}
                      {getRoleBadge(user.roles)}
                    </td>
                    <td className="px-6 py-4 text-sm text-flow-text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUserRole === "ADMIN" && (
                        <button
                          aria-label="Delete User"
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onRefresh={fetchUsers}
        />
      )}
    </div>
  );
};

export default UsersPage;
