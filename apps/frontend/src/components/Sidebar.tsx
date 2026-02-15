import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Settings,
  LogOut,
  KanbanSquare, // Import this new icon
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.roles?.some((r: any) => r.name === "ADMIN");
  const isAdminOrManager = user?.roles?.some(
    (r: any) => r.name === "ADMIN" || r.name === "MANAGER",
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: ListTodo, label: "Tasks List", path: "/tasks" }, // Renamed slightly for clarity
    { icon: KanbanSquare, label: "Board View", path: "/tasks/board" }, // NEW ITEM
    { icon: Users, label: "Team", path: "/users" },
    ...(isAdminOrManager
      ? [{ icon: Users, label: "Team", path: "/users" }]
      : []),
    ...(isAdmin ? [{ icon: Users, label: "Team", path: "/users" }] : []),
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  // ... rest of the component remains EXACTLY the same ...
  return (
    <aside className="w-64 bg-flow-indigo h-screen flex flex-col text-white sticky top-0">
      <div className="p-6 text-xl font-bold tracking-tight italic border-b border-white/10">
        flowdash
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/tasks"} // FIX: Only exact match for '/tasks' to avoid conflict with '/tasks/board'
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-flow-blue text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
