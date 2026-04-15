import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  FileWarning,
  Loader2,
  Shield,
} from "lucide-react";

import { PROJECT_STATUS } from "@/shared/constants/project";
import {
  getApprovedStatus,
  getDropdownStatusLabel,
  getProjectStatusLabel,
  getResumeStatus,
  normalizeProjectStatus,
} from "../utils/projectStatus.utils";

const resolveTargetLabel = (report) => {
  const target = report?.target_ref;

  if (report?.target_type === "project") {
    return target?.title || `Project ${target?._id?.slice(-4) || ""}`;
  }

  if (report?.target_type === "user") {
    return (
      target?.fullName ||
      target?.email ||
      target?.username ||
      `User ${target?._id?.slice(-4) || ""}`
    );
  }

  return target?.content || target?._id || report?.target_type || "Unknown";
};

const resolveTargetLink = (report) => {
  const target = report?.target_ref;

  // Do not assume an admin-specific project detail route exists.
  if (report?.target_type === "project" && target?._id) {
    return null;
  }

  if (report?.target_type === "user" && target?._id) {
    return `/users/${target._id}`;
  }

  return null;
};

const resolveReporterLabel = (reporter) => {
  if (!reporter) return "Unknown";
  return reporter.fullName || reporter.username || reporter.email || "Unknown";
};

const buildReportActionReason = (report) =>
  `Action from report moderation #${report?._id?.slice(-6) || ""}`;

const getReportProjectStatusOptions = (project) => {
  const currentStatus = normalizeProjectStatus(project?.status);

  let statuses = [currentStatus];

  switch (currentStatus) {
    case PROJECT_STATUS.PENDING_APPROVAL:
    case PROJECT_STATUS.REVISION_REQUESTED:
      statuses = [
        currentStatus,
        getApprovedStatus(project),
        PROJECT_STATUS.REVISION_REQUESTED,
        PROJECT_STATUS.REJECTED,
      ];
      break;

    case PROJECT_STATUS.FUNDING:
    case PROJECT_STATUS.RECRUITING:
    case PROJECT_STATUS.EXECUTING:
    case PROJECT_STATUS.ACTIVE:
      statuses = [
        currentStatus,
        PROJECT_STATUS.PAUSED,
        PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
        PROJECT_STATUS.CANCELLED_BY_PLATFORM,
      ];
      break;

    case PROJECT_STATUS.PAUSED:
      statuses = [
        currentStatus,
        getResumeStatus(project),
        PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
        PROJECT_STATUS.CANCELLED_BY_PLATFORM,
      ];
      break;

    default:
      statuses = [currentStatus];
      break;
  }

  return [...new Set(statuses)].map((status) => {
    const normalized = normalizeProjectStatus(status);
    const isResumeOption =
      currentStatus === PROJECT_STATUS.PAUSED &&
      (normalized === PROJECT_STATUS.FUNDING ||
        normalized === PROJECT_STATUS.RECRUITING);

    return {
      value: normalized,
      label:
        normalized === currentStatus &&
        (currentStatus === PROJECT_STATUS.PENDING_APPROVAL ||
          currentStatus === PROJECT_STATUS.REVISION_REQUESTED)
          ? "🟡 Chờ duyệt"
          : getDropdownStatusLabel(normalized, project?.projectType, {
              isResume: isResumeOption,
            }) || getProjectStatusLabel(normalized),
    };
  });
};

const ActivityTable = ({
  activities = [],
  onAction,
  onProjectStatusChange,
  onUserBanToggle,
  loading,
}) => {
  const [projectStatuses, setProjectStatuses] = useState({});
  const [userActionLoadingMap, setUserActionLoadingMap] = useState({});
  const [projectActionLoadingMap, setProjectActionLoadingMap] = useState({});

  const safeActivities = useMemo(
    () => (Array.isArray(activities) ? activities : []),
    [activities]
  );

  const handleProjectStatusApply = async (report) => {
    const target = report?.target_ref;
    if (!target?._id || !onProjectStatusChange) return;

    const currentStatus = normalizeProjectStatus(target?.status);
    const nextStatus = normalizeProjectStatus(
      projectStatuses[report._id] || currentStatus
    );

    if (!nextStatus || nextStatus === currentStatus) return;

    try {
      setProjectActionLoadingMap((prev) => ({ ...prev, [report._id]: true }));
      await onProjectStatusChange(target._id, {
        status: nextStatus,
        reason: buildReportActionReason(report),
      });
    } finally {
      setProjectActionLoadingMap((prev) => ({ ...prev, [report._id]: false }));
    }
  };

  const handleUserBanToggle = async (report) => {
    const target = report?.target_ref;
    if (!target?._id || !onUserBanToggle) return;

    try {
      setUserActionLoadingMap((prev) => ({ ...prev, [report._id]: true }));
      await onUserBanToggle(target._id, buildReportActionReason(report));
    } finally {
      setUserActionLoadingMap((prev) => ({ ...prev, [report._id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-20 text-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-500">
          <Loader2 size={18} className="animate-spin text-amber-500" />
          Loading system logs...
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h3 className="text-lg font-black text-slate-800">Recent Activity</h3>
          <p className="mt-1 text-sm text-slate-500">
            Review reports and take moderation actions.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50/60">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Event ID
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Target
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Details
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {safeActivities.length > 0 ? (
              safeActivities.map((report) => {
                const target = report?.target_ref;
                const targetLabel = resolveTargetLabel(report);
                const targetLink = resolveTargetLink(report);

                const projectStatusOptions = getReportProjectStatusOptions(target);
                const currentProjectStatus = normalizeProjectStatus(
                  projectStatuses[report._id] || target?.status || ""
                );
                const originalProjectStatus = normalizeProjectStatus(
                  target?.status || ""
                );

                const isPending = report?.status === "pending";
                const isProject = report?.target_type === "project";
                const isUser = report?.target_type === "user";

                const isUserLoading = Boolean(userActionLoadingMap[report._id]);
                const isProjectLoading = Boolean(
                  projectActionLoadingMap[report._id]
                );

                const canApplyProjectStatus =
                  Boolean(currentProjectStatus) &&
                  currentProjectStatus !== originalProjectStatus;

                return (
                  <tr
                    key={report._id}
                    className="transition-colors hover:bg-slate-50/40"
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
                          {report?.reason_code || "Report"}
                        </span>
                      </div>

                      <div className="truncate text-slate-500">
                        {report?.description || "No description"}
                      </div>

                      {report?.reporter_ref && (
                        <div className="mt-2 text-xs text-slate-400">
                          Reporter:{" "}
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
                                  setProjectStatuses((prev) => ({
                                    ...prev,
                                    [report._id]: e.target.value,
                                  }))
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
                                disabled={isProjectLoading || !canApplyProjectStatus}
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
                                Apply Status
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
                                ? "Unban user"
                                : "Ban user"}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => onAction?.(report._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-bold uppercase text-amber-700 hover:bg-amber-100"
                          >
                            <AlertTriangle size={12} />
                            Resolve report
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">
                          <CheckCircle2 size={12} />
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
                  className="px-6 py-12 text-center text-sm italic text-slate-400"
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