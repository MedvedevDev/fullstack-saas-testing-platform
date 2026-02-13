import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex bg-flow-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-flow-border flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-flow-text-main">
            Welcome Back
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-flow-blue flex items-center justify-center text-white text-xs font-bold">
              JD
            </div>
            <span className="text-sm font-medium text-flow-text-main">
              John Doe
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
