import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Layers, CheckCircle2, Users } from "lucide-react";

interface StatsProps {
  stats: {
    totalProjects: number;
    totalUsers: number;
    tasksByStatus: {
      TODO: number;
      IN_PROGRESS: number;
      DONE: number;
    };
  };
}

const DashboardStats = ({ stats }: StatsProps) => {
  const data = [
    { name: "To Do", value: stats.tasksByStatus.TODO || 0, color: "#94a3b8" },
    {
      name: "In Progress",
      value: stats.tasksByStatus.IN_PROGRESS || 0,
      color: "#3b82f6",
    },
    { name: "Done", value: stats.tasksByStatus.DONE || 0, color: "#22c55e" },
  ];

  const totalTasks = data.reduce((acc, curr) => acc + curr.value, 0);

  const completionPercentage =
    totalTasks > 0
      ? Math.round((stats.tasksByStatus.DONE / totalTasks) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Metric Cards Column */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Projects */}
        <div className="bg-white p-6 rounded-xl border border-flow-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Layers className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              +12%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-flow-text-main mt-4">
              {stats.totalProjects}
            </h3>
            <p className="text-sm text-flow-text-muted">Active Projects</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white p-6 rounded-xl border border-flow-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-flow-text-main mt-4">
              {totalTasks}
            </h3>
            <p className="text-sm text-flow-text-muted">Total Tasks</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white p-6 rounded-xl border border-flow-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-flow-text-main mt-4">
              {stats.totalUsers}
            </h3>
            <p className="text-sm text-flow-text-muted">Team Members</p>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white p-6 rounded-xl border border-flow-border shadow-sm flex flex-col h-full">
        <h3 className="font-bold text-flow-text-main mb-4">Task Completion</h3>

        <div className="flex-1 min-h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  padding: "8px 12px",
                }}
                itemStyle={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
                // FIX: Use 'any' for the argument to bypass strict union type mismatch
                formatter={(value: any) => [`${value} Tasks`, "Count"]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block text-3xl font-bold text-flow-text-main">
                {completionPercentage}%
              </span>
              <span className="text-[10px] text-flow-text-muted uppercase tracking-wider font-bold">
                Done
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-flow-text-muted font-bold uppercase tracking-wider">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
