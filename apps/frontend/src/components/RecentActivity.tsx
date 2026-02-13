import { History } from "lucide-react";

interface Log {
  id: string;
  action: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const RecentActivity = ({ logs }: { logs: Log[] }) => {
  return (
    <div className="bg-white border border-flow-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-flow-border flex items-center gap-3">
        <div className="bg-purple-50 p-2 rounded-lg">
          <History className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="font-bold text-flow-text-main">Recent Activity</h3>
      </div>
      <div className="divide-y divide-flow-border max-h-[400px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-flow-text-muted text-sm">
            No recent activity found.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-gray-50 transition-colors flex gap-4 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-flow-blue/10 flex items-center justify-center text-flow-blue text-xs font-bold shrink-0">
                {log.user.firstName[0]}
                {log.user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-flow-text-main">
                  <span className="font-semibold">{log.user.firstName}</span>{" "}
                  {log.action.split(":")[0].toLowerCase().replace("_", " ")}
                </p>
                <p className="text-xs text-flow-text-muted truncate mt-0.5">
                  {log.action.split(":")[1] || "Action performed"}
                </p>
              </div>
              <span className="text-[10px] text-flow-text-muted whitespace-nowrap">
                {new Date(log.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
