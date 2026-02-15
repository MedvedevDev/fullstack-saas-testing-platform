import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

const DashboardLayout = () => {
  const [user, setUser] = useState({ firstName: "", lastName: "" });
  const location = useLocation();

  // Fetch user data whenever the layout mounts or the route changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUser();
  }, [location.pathname]);

  return (
    <div className="flex bg-flow-bg min-h-screen font-sans text-flow-text-main transition-colors duration-300">
      {/* Sidebar (Left) */}
      <Sidebar />

      {/* Main Content Area (Right) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        {/* FIX 2: Changed 'bg-white' to 'bg-flow-card' so header turns dark too */}
        <header className="h-16 bg-flow-card border-b border-flow-border flex items-center justify-between px-8 shrink-0 transition-colors duration-300">
          <h1 className="font-bold text-xl text-flow-text-main">
            Welcome Back
          </h1>

          <div className="flex items-center gap-3">
            {/* Dynamic Avatar */}
            <div className="w-9 h-9 rounded-full bg-flow-blue text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user.firstName
                ? `${user.firstName[0]}${user.lastName[0]}`
                : "..."}
            </div>

            {/* Dynamic Name */}
            <span className="text-sm font-medium text-flow-text-main">
              {user.firstName
                ? `${user.firstName} ${user.lastName}`
                : "Loading..."}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
