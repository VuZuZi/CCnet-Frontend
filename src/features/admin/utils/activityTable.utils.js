import { PROJECT_STATUS } from "@/shared/constants/project";
import {
  getApprovedStatus,
  getDropdownStatusLabel,
  getProjectStatusLabel,
  getResumeStatus,
  normalizeProjectStatus,
} from "../utils/projectStatus.utils";

export const resolveTargetLabel = (report) => {
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

export const resolveTargetLink = (report) => {
  const target = report?.target_ref;

  if (report?.target_type === "project" && target?._id) {
    return null;
  }

  if (report?.target_type === "user" && target?._id) {
    return `/users/${target._id}`;
  }

  return null;
};

export const resolveReporterLabel = (reporter) => {
  if (!reporter) return "Unknown";
  return reporter.fullName || reporter.username || reporter.email || "Unknown";
};

export const buildReportActionReason = (report) =>
  `Action from report moderation #${report?._id?.slice(-6) || ""}`;

export const getReportProjectStatusOptions = (project) => {
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