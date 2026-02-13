import { useState, useEffect } from "react";
import api from "../api/axios";
import DashboardStats from "../components/DashboardStats";
import RecentActivity from "../components/RecentActivity";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalProjects: 0,
      totalUsers: 0,
      tasksByStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
    },
    logs: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/logs"),
        ]);

        setData({
          stats: statsRes.data,
          logs: logsRes.data,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="text-flow-text-muted font-medium">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-flow-text-main">
          Dashboard Overview
        </h2>
        <p className="text-sm text-flow-text-muted">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <DashboardStats stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity logs={data.logs} />

        {/* Placeholder for future widget (e.g., Upcoming Deadlines) */}
        <div className="bg-white border border-dashed border-flow-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">
            🚀
          </div>
          <h3 className="font-bold text-flow-text-main">
            Pro Feature Unlocked
          </h3>
          <p className="text-sm text-flow-text-muted max-w-xs mt-2">
            Your dashboard is now fully connected to your live database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
