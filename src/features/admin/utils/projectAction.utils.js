import { PROJECT_STATUS } from "@/shared/constants/project";
import {
  getApprovedStatus,
  getDropdownStatusLabel,
  getProjectStatusLabel,
  getResumeStatus,
  isReviewableProjectStatus,
  normalizeProjectStatus,
} from "./projectStatus.utils";

export const ADMIN_PROJECT_ACTION_KEYS = {
  APPROVE_PROJECT: "APPROVE_PROJECT",
  REQUEST_PROJECT_REVISION: "REQUEST_PROJECT_REVISION",
  REJECT_PROJECT: "REJECT_PROJECT",
  REQUEST_PROJECT_UPDATE: "REQUEST_PROJECT_UPDATE",
  PAUSE_PROJECT: "PAUSE_PROJECT",
  RESUME_PROJECT: "RESUME_PROJECT",
  COMPLETE_PROJECT: "COMPLETE_PROJECT",
  CANCEL_PROJECT: "CANCEL_PROJECT",
  UPDATE_PROJECT_STATUS: "UPDATE_PROJECT_STATUS",
};

export const ADMIN_PROJECT_ACTION_LABELS = {
  [ADMIN_PROJECT_ACTION_KEYS.APPROVE_PROJECT]: "Phê duyệt dự án",
  [ADMIN_PROJECT_ACTION_KEYS.REQUEST_PROJECT_REVISION]: "Yêu cầu chỉnh sửa",
  [ADMIN_PROJECT_ACTION_KEYS.REJECT_PROJECT]: "Từ chối dự án",
  [ADMIN_PROJECT_ACTION_KEYS.REQUEST_PROJECT_UPDATE]: "Yêu cầu cập nhật",
  [ADMIN_PROJECT_ACTION_KEYS.PAUSE_PROJECT]: "Tạm dừng dự án",
  [ADMIN_PROJECT_ACTION_KEYS.RESUME_PROJECT]: "Tiếp tục dự án",
  [ADMIN_PROJECT_ACTION_KEYS.COMPLETE_PROJECT]: "Hoàn thành dự án",
  [ADMIN_PROJECT_ACTION_KEYS.CANCEL_PROJECT]: "Hủy dự án",
  [ADMIN_PROJECT_ACTION_KEYS.UPDATE_PROJECT_STATUS]: "Cập nhật trạng thái",
};

export const ADMIN_PROJECT_ACTION_BADGE_STYLES = {
  [ADMIN_PROJECT_ACTION_KEYS.APPROVE_PROJECT]:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  [ADMIN_PROJECT_ACTION_KEYS.REQUEST_PROJECT_REVISION]:
    "border-orange-200 bg-orange-50 text-orange-700",
  [ADMIN_PROJECT_ACTION_KEYS.REJECT_PROJECT]:
    "border-rose-200 bg-rose-50 text-rose-700",
  [ADMIN_PROJECT_ACTION_KEYS.REQUEST_PROJECT_UPDATE]:
    "border-amber-200 bg-amber-50 text-amber-800",
  [ADMIN_PROJECT_ACTION_KEYS.PAUSE_PROJECT]:
    "border-orange-200 bg-orange-50 text-orange-700",
  [ADMIN_PROJECT_ACTION_KEYS.RESUME_PROJECT]:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  [ADMIN_PROJECT_ACTION_KEYS.COMPLETE_PROJECT]:
    "border-blue-200 bg-blue-50 text-blue-700",
  [ADMIN_PROJECT_ACTION_KEYS.CANCEL_PROJECT]:
    "border-rose-200 bg-rose-50 text-rose-700",
  [ADMIN_PROJECT_ACTION_KEYS.UPDATE_PROJECT_STATUS]:
    "border-slate-200 bg-slate-50 text-slate-700",
};

const ACTIVE_ENTRY_STATUSES = [
  PROJECT_STATUS.FUNDING,
  PROJECT_STATUS.RECRUITING,
];

const COMPLETABLE_STATUSES = [
  PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
  PROJECT_STATUS.COMPLETED_PARTIAL,
];

const CANCELLABLE_STATUSES = [
  PROJECT_STATUS.CANCELLED_BY_PLATFORM,
  PROJECT_STATUS.CANCELLED_BY_ORGANIZER,
  PROJECT_STATUS.CANCELLED_FRAUD,
];

export function getProjectActionLabel(actionKey) {
  return ADMIN_PROJECT_ACTION_LABELS[actionKey] || actionKey || "Hành động";
}

export function getProjectActionBadgeClass(actionKey) {
  return (
    ADMIN_PROJECT_ACTION_BADGE_STYLES[actionKey] ||
    "border-slate-200 bg-slate-50 text-slate-700"
  );
}

export function getAllowedNextProjectStatuses(project) {
  const realStatus = normalizeProjectStatus(project?.status);

  switch (realStatus) {
    case PROJECT_STATUS.PENDING_APPROVAL:
    case PROJECT_STATUS.REVISION_REQUESTED:
      return [
        PROJECT_STATUS.REVISION_REQUESTED,
        PROJECT_STATUS.REJECTED,
      ];

    case PROJECT_STATUS.EXECUTING:
    case PROJECT_STATUS.ACTIVE:
      return [
        PROJECT_STATUS.UPDATING,
        PROJECT_STATUS.PAUSED,
        PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
        PROJECT_STATUS.CANCELLED_BY_PLATFORM,
      ];

    case PROJECT_STATUS.PAUSED:
      return [
        getResumeStatus(project),
        PROJECT_STATUS.UPDATING,
        PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
        PROJECT_STATUS.CANCELLED_BY_PLATFORM,
      ];

    case PROJECT_STATUS.UPDATING:
      return [
        PROJECT_STATUS.EXECUTING,
        PROJECT_STATUS.PAUSED,
        PROJECT_STATUS.CANCELLED_BY_PLATFORM,
      ];

    case PROJECT_STATUS.FUNDING:
    case PROJECT_STATUS.RECRUITING:
      return [
        PROJECT_STATUS.UPDATING,
        PROJECT_STATUS.PAUSED,
        PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
        PROJECT_STATUS.CANCELLED_BY_PLATFORM,
      ];

    default:
      return [];
  }
}

export function buildProjectStatusOptions(project) {
  const realStatus = normalizeProjectStatus(project?.status);
  const nextStatuses = getAllowedNextProjectStatuses(project);
  const allStatuses = [realStatus, ...nextStatuses];

  return [...new Set(allStatuses)].map((status) => {
    const normalizedStatus = normalizeProjectStatus(status);

    if (normalizedStatus === realStatus) {
      return {
        value: status,
        label: getProjectStatusLabel(status),
      };
    }

    const isResumeOption =
      realStatus === PROJECT_STATUS.PAUSED &&
      ACTIVE_ENTRY_STATUSES.includes(normalizedStatus);

    return {
      value: status,
      label: getDropdownStatusLabel(status, project?.projectType, {
        isResume: isResumeOption,
      }),
    };
  });
}

export function getPrimaryProjectAction(project) {
  const realStatus = normalizeProjectStatus(project?.status);

  if (isReviewableProjectStatus(realStatus)) {
    return {
      actionKey: ADMIN_PROJECT_ACTION_KEYS.APPROVE_PROJECT,
      label: "Phê duyệt",
      nextStatus: getApprovedStatus(project),
      title: "Phê duyệt dự án",
      className:
        "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50",
    };
  }

  return null;
}

export function getProjectActionKeyFromNextStatus(
  nextStatus,
  currentStatus = "",
) {
  const normalizedNextStatus = normalizeProjectStatus(nextStatus);
  const normalizedCurrentStatus = normalizeProjectStatus(currentStatus);

  if (ACTIVE_ENTRY_STATUSES.includes(normalizedNextStatus)) {
    if (normalizedCurrentStatus === PROJECT_STATUS.PAUSED) {
      return ADMIN_PROJECT_ACTION_KEYS.RESUME_PROJECT;
    }

    return ADMIN_PROJECT_ACTION_KEYS.APPROVE_PROJECT;
  }

  if (
    normalizedNextStatus === PROJECT_STATUS.EXECUTING &&
    normalizedCurrentStatus === PROJECT_STATUS.UPDATING
  ) {
    return ADMIN_PROJECT_ACTION_KEYS.RESUME_PROJECT;
  }

  if (normalizedNextStatus === PROJECT_STATUS.REVISION_REQUESTED) {
    return ADMIN_PROJECT_ACTION_KEYS.REQUEST_PROJECT_REVISION;
  }

  if (normalizedNextStatus === PROJECT_STATUS.REJECTED) {
    return ADMIN_PROJECT_ACTION_KEYS.REJECT_PROJECT;
  }

  if (normalizedNextStatus === PROJECT_STATUS.UPDATING) {
    return ADMIN_PROJECT_ACTION_KEYS.REQUEST_PROJECT_UPDATE;
  }

  if (normalizedNextStatus === PROJECT_STATUS.PAUSED) {
    return ADMIN_PROJECT_ACTION_KEYS.PAUSE_PROJECT;
  }

  if (COMPLETABLE_STATUSES.includes(normalizedNextStatus)) {
    return ADMIN_PROJECT_ACTION_KEYS.COMPLETE_PROJECT;
  }

  if (CANCELLABLE_STATUSES.includes(normalizedNextStatus)) {
    return ADMIN_PROJECT_ACTION_KEYS.CANCEL_PROJECT;
  }

  return ADMIN_PROJECT_ACTION_KEYS.UPDATE_PROJECT_STATUS;
}

export function projectActionRequiresReason(actionKey) {
  return actionKey !== ADMIN_PROJECT_ACTION_KEYS.APPROVE_PROJECT;
}
