import { useState } from "react";
import { Link } from "react-router-dom";

const ActivityTable = ({ activities = [], onAction, onProjectStatusChange, onUserBanToggle, loading }) => {
  const [projectStatuses, setProjectStatuses] = useState({});

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
                Target
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Details
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* 2. Defensive check: only map if activities is an array with items */}
            {Array.isArray(activities) && activities.length > 0 ? (
              activities.map((report) => {
                const target = report.target_ref;
                const currentProjectStatus =
                  projectStatuses[report._id] || target?.status || "PENDING_APPROVAL";
                const targetLabel =
                  report.target_type === "project"
                    ? target?.title || `Project ${target?._id?.slice(-4)}`
                    : report.target_type === "user"
                      ? target?.fullName || target?.email || `User ${target?._id?.slice(-4)}`
                      : target?.content || target?._id || report.target_type;
                const targetLink =
                  report.target_type === "project"
                    ? `/admin/projects/${target?._id}`
                    : report.target_type === "user"
                      ? `/users/${target?._id}`
                      : null;

                return (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      #{report._id?.slice(-4).toUpperCase() || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {targetLink ? (
                        <Link
                          to={targetLink}
                          className="text-sm font-bold text-slate-700 hover:text-amber-600"
                        >
                          {targetLabel}
                        </Link>
                      ) : (
                        <span className="text-sm font-bold text-slate-700">
                          {targetLabel}
                        </span>
                      )}
                      <div className="text-[11px] text-slate-500 mt-1">
                        {report.target_type?.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      <div className="font-semibold mb-1">{report.reason_code || "Report"}</div>
                      <div className="text-slate-500 truncate">{report.description || "No description"}</div>
                      {report.reporter_ref && (
                        <div className="mt-2 text-xs text-slate-400">
                          Reporter:{" "}
                          {report.reporter_ref._id ? (
                            <Link
                              to={`/users/${report.reporter_ref._id}`}
                              className="font-semibold text-slate-700 hover:text-amber-600"
                            >
                              {report.reporter_ref.fullName || report.reporter_ref.username || report.reporter_ref.email}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-700">
                              {report.reporter_ref.fullName || report.reporter_ref.username || report.reporter_ref.email}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-y-2">
                      {report.status === "pending" ? (
                        <>
                          {report.target_type === "project" && target?._id && onProjectStatusChange && (
                            <div className="flex flex-col items-end gap-2">
                              <select
                                value={currentProjectStatus}
                                onChange={(e) =>
                                  setProjectStatuses((prev) => ({
                                    ...prev,
                                    [report._id]: e.target.value,
                                  }))
                                }
                                className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700"
                              >
                                <option value="PENDING_APPROVAL">Chờ duyệt</option>
                                <option value="ACTIVE">Kích hoạt</option>
                                <option value="PAUSED">Tạm dừng</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                              </select>

                            </div>
                          )}

                          {report.target_type === "user" && target?._id && onUserBanToggle && (
                            <button
                              type="button"
                              onClick={() => onUserBanToggle(target._id)}
                              className="px-3 py-1 text-[10px] font-bold rounded-md uppercase bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              {target?.isActive === false ? "Unban user" : "Ban user"}
                            </button>
                          )}

                          <button
                            onClick={() => onAction(report._id)}
                            className="px-3 py-1 text-[10px] font-bold rounded-md uppercase bg-amber-100 text-amber-700 hover:bg-amber-200"
                          >
                            Resolve report
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-700">
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
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