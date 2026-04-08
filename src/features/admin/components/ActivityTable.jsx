const ActivityTable = ({ activities = [], onAction, loading }) => {
  // 1. Prevent mapping if loading
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-slate-500 font-medium">
          Loading system logs...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Event ID
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Source
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Details
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* 2. Defensive check: only map if activities is an array with items */}
            {Array.isArray(activities) && activities.length > 0 ? (
              activities.map((report) => (
                <tr
                  key={report._id}
                  className="hover:bg-slate-50/30 transition-colors"
                >
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">
                    #{report._id?.slice(-4).toUpperCase() || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">
                      {report.target_type || "System"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {report.reason_code || "Report"}:{" "}
                    {report.description || "No description"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onAction(report._id)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase transition-all ${report.status === "pending"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-700"
                        }`}
                    >
                      {report.status === "pending" ? "Action" : "Resolved"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-400 italic text-sm"
                >
                  No recent activity or reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;