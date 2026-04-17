import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  FileWarning,
  Loader2,
  Shield,
} from "lucide-react";
import useActivityTableActions from "../hooks/useActivityTableActions";
import { normalizeProjectStatus } from "../utils/projectStatus.utils";
import {
  getReportProjectStatusOptions,
  resolveReporterLabel,
  resolveTargetLabel,
  resolveTargetLink,
} from "../utils/activityTable.utils";

const ActivityTable = ({
  activities = [],
  onAction,
  onProjectStatusChange,
  onUserBanToggle,
  loading,
}) => {
  const {
    safeActivities,
    projectStatuses,
    userActionLoadingMap,
    projectActionLoadingMap,
    handleProjectStatusSelect,
    handleProjectStatusApply,
    handleUserBanToggle,
  } = useActivityTableActions({
    activities,
    onProjectStatusChange,
    onUserBanToggle,
  });

  const rows = useMemo(
    () =>
      safeActivities.map((report) => {
        const target = report?.target_ref;
        const targetLabel = resolveTargetLabel(report);
        const targetLink = resolveTargetLink(report);

        const projectStatusOptions = getReportProjectStatusOptions(target);
        const currentProjectStatus = normalizeProjectStatus(
          projectStatuses[report._id] || target?.status || ""
        );
        const originalProjectStatus = normalizeProjectStatus(target?.status || "");

        const isPending = report?.status === "pending";
        const isProject = report?.target_type === "project";
        const isUser = report?.target_type === "user";

        const isUserLoading = Boolean(userActionLoadingMap[report._id]);
        const isProjectLoading = Boolean(projectActionLoadingMap[report._id]);

        const canApplyProjectStatus =
          Boolean(currentProjectStatus) &&
          currentProjectStatus !== originalProjectStatus;

        return {
          report,
          target,
          targetLabel,
          targetLink,
          projectStatusOptions,
          currentProjectStatus,
          isPending,
          isProject,
          isUser,
          isUserLoading,
          isProjectLoading,
          canApplyProjectStatus,
        };
      }),
    [
      safeActivities,
      projectStatuses,
      userActionLoadingMap,
      projectActionLoadingMap,
    ]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-20 text-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-500">
          <Loader2 size={18} className="animate-spin text-amber-500" />
          Đang tải nhật ký hệ thống...
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h3 className="text-lg font-black text-slate-800">Hoạt động gần đây</h3>
          <p className="mt-1 text-sm text-slate-500">
            Xem xét các báo cáo và thực hiện hành động kiểm duyệt.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50/60">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Mã sự kiện
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Mục tiêu
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Chi tiết
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map(
                ({
                  report,
                  target,
                  targetLabel,
                  targetLink,
                  projectStatusOptions,
                  currentProjectStatus,
                  isPending,
                  isProject,
                  isUser,
                  isUserLoading,
                  isProjectLoading,
                  canApplyProjectStatus,
                }) => (
                  <tr
                    key={report._id}
                    className="transition-colors hover:bg-slate-50/40"
                  >
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      #{report._id?.slice(-4).toUpperCase() || "Không có"}
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

                      <div className="mt-1 text-[11px] text-slate-500">
                        {String(report?.target_type || "")
                          .toUpperCase()
                          .replace("_", " ")}
                      </div>
                    </td>

                    <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                      <div className="mb-1 flex items-center gap-2">
                        <FileWarning size={14} className="text-amber-500" />
                        <span className="font-semibold">
                          {report?.reason_code || "Báo cáo"}
                        </span>
                      </div>

                      <div className="truncate text-slate-500">
                        {report?.description || "Không có mô tả"}
                      </div>

                      {report?.reporter_ref && (
                        <div className="mt-2 text-xs text-slate-400">
                          Người báo cáo:{" "}
                          {report.reporter_ref._id ? (
                            <Link
                              to={`/users/${report.reporter_ref._id}`}
                              className="font-semibold text-slate-700 hover:text-amber-600"
                            >
                              {resolveReporterLabel(report.reporter_ref)}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-700">
                              {resolveReporterLabel(report.reporter_ref)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isPending ? (
                        <div className="flex flex-col items-end gap-2">
                          {isProject && target?._id && onProjectStatusChange ? (
                            <div className="flex flex-col items-end gap-2">
                              <select
                                value={currentProjectStatus}
                                onChange={(e) =>
                                  handleProjectStatusSelect(
                                    report._id,
                                    e.target.value
                                  )
                                }
                                disabled={isProjectLoading}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                              >
                                {projectStatusOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => handleProjectStatusApply(report)}
                                disabled={
                                  isProjectLoading || !canApplyProjectStatus
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-bold uppercase text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                              >
                                {isProjectLoading ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Shield size={12} />
                                )}
                                Áp dụng trạng thái
                              </button>
                            </div>
                          ) : null}

                          {isUser && target?._id && onUserBanToggle ? (
                            <button
                              type="button"
                              onClick={() => handleUserBanToggle(report)}
                              disabled={isUserLoading}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold uppercase text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              {isUserLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Ban size={12} />
                              )}
                              {target?.isActive === false
                                ? "Bỏ cấm người dùng"
                                : "Cấm người dùng"}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => onAction?.(report._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-bold uppercase text-amber-700 hover:bg-amber-100"
                          >
                            <AlertTriangle size={12} />
                            Giải quyết báo cáo
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">
                          <CheckCircle2 size={12} />
                          Đã giải quyết
                        </span>
                      )}
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-sm italic text-slate-400"
                >
                  Không tìm thấy hoạt động hoặc báo cáo nào gần đây.
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