import { PROJECT_STATUS, PROJECT_TYPE } from "@/shared/constants/project";

export const ADMIN_UI_PROJECT_STATUS = {
  ACTIVE: "ACTIVE",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  UPDATING: "UPDATING",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const ADMIN_PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.DRAFT]: "Bản nháp",
  [PROJECT_STATUS.UNDER_REVIEW]: "Chờ kiểm duyệt",
  [PROJECT_STATUS.PENDING_APPROVAL]: "Chờ kiểm duyệt",
  [PROJECT_STATUS.REVISION_REQUESTED]: "Yêu cầu chỉnh sửa",
  [PROJECT_STATUS.REJECTED]: "Đã từ chối",

  [PROJECT_STATUS.FUNDING]: "Đang gây quỹ",
  [PROJECT_STATUS.RECRUITING]: "Đang tuyển tình nguyện viên",
  [PROJECT_STATUS.EXECUTING]: "Đang thực hiện",
  [PROJECT_STATUS.ACTIVE]: "Đang hoạt động",
  [PROJECT_STATUS.UPDATING]: "Đang cập nhật",
  [PROJECT_STATUS.PAUSED]: "Tạm dừng",

  [PROJECT_STATUS.COMPLETED_SUCCESSFULLY]: "Đã hoàn thành",
  [PROJECT_STATUS.COMPLETED_PARTIAL]: "Hoàn thành một phần",

  [PROJECT_STATUS.CANCELLED_BY_PLATFORM]: "Đã hủy",
  [PROJECT_STATUS.CANCELLED_BY_ORGANIZER]: "Đã hủy",
  [PROJECT_STATUS.CANCELLED_FRAUD]: "Đã hủy",

  DELETED: "Đã xóa",

  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

export const ADMIN_UI_STATUS_LABELS = {
  [ADMIN_UI_PROJECT_STATUS.ACTIVE]: "Đang hoạt động",
  [ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL]: "Chờ kiểm duyệt",
  [ADMIN_UI_PROJECT_STATUS.UPDATING]: "Đang cập nhật",
  [ADMIN_UI_PROJECT_STATUS.PAUSED]: "Tạm dừng",
  [ADMIN_UI_PROJECT_STATUS.COMPLETED]: "Đã hoàn thành",
  [ADMIN_UI_PROJECT_STATUS.CANCELLED]: "Đã hủy",
};

export const ADMIN_UI_STATUS_STYLES = {
  [ADMIN_UI_PROJECT_STATUS.ACTIVE]: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "A",
  },
  [ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL]: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "P",
  },
  [ADMIN_UI_PROJECT_STATUS.UPDATING]: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: "U",
  },
  [ADMIN_UI_PROJECT_STATUS.PAUSED]: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: "II",
  },
  [ADMIN_UI_PROJECT_STATUS.COMPLETED]: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "OK",
  },
  [ADMIN_UI_PROJECT_STATUS.CANCELLED]: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "X",
  },
};

export const REVIEWABLE_REAL_STATUSES = [
  PROJECT_STATUS.PENDING_APPROVAL,
  PROJECT_STATUS.REVISION_REQUESTED,
];

export const MANAGEABLE_REAL_STATUSES = [
  PROJECT_STATUS.FUNDING,
  PROJECT_STATUS.RECRUITING,
  PROJECT_STATUS.EXECUTING,
  PROJECT_STATUS.ACTIVE,
  PROJECT_STATUS.UPDATING,
  PROJECT_STATUS.PAUSED,
];

export const COMPLETED_REAL_STATUSES = [
  PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
  PROJECT_STATUS.COMPLETED_PARTIAL,
  "COMPLETED",
];

export const CANCELLED_REAL_STATUSES = [
  PROJECT_STATUS.CANCELLED_BY_PLATFORM,
  PROJECT_STATUS.CANCELLED_BY_ORGANIZER,
  PROJECT_STATUS.CANCELLED_FRAUD,
  PROJECT_STATUS.REJECTED,
  "CANCELLED",
];

export const LIVE_REAL_STATUSES = [
  PROJECT_STATUS.ACTIVE,
  PROJECT_STATUS.FUNDING,
  PROJECT_STATUS.RECRUITING,
  PROJECT_STATUS.EXECUTING,
];

export const PENDING_REAL_STATUSES = [
  PROJECT_STATUS.PENDING_APPROVAL,
  PROJECT_STATUS.REVISION_REQUESTED,
  PROJECT_STATUS.UNDER_REVIEW,
];

const DROPDOWN_STATUS_LABELS = {
  [PROJECT_STATUS.REVISION_REQUESTED]: "Yêu cầu chỉnh sửa",
  [PROJECT_STATUS.REJECTED]: "Từ chối",
  [PROJECT_STATUS.UPDATING]: "Đang cập nhật",
  [PROJECT_STATUS.PAUSED]: "Tạm dừng",
  [PROJECT_STATUS.COMPLETED_SUCCESSFULLY]: "Hoàn thành",
  [PROJECT_STATUS.COMPLETED_PARTIAL]: "Hoàn thành một phần",
  [PROJECT_STATUS.CANCELLED_BY_PLATFORM]: "Hủy",
  [PROJECT_STATUS.CANCELLED_BY_ORGANIZER]: "Hủy",
  [PROJECT_STATUS.CANCELLED_FRAUD]: "Hủy",
  [PROJECT_STATUS.PENDING_APPROVAL]: "Chờ kiểm duyệt",
  [PROJECT_STATUS.UNDER_REVIEW]: "Chờ kiểm duyệt",
  [PROJECT_STATUS.EXECUTING]: "Đang thực hiện",
};

export function normalizeProjectStatus(status) {
  return String(status || "").trim().toUpperCase();
}

export function normalizeProjectType(projectType) {
  return String(projectType || "").trim().toUpperCase();
}

export function isVolunteerOnlyProject(projectType) {
  return normalizeProjectType(projectType) === PROJECT_TYPE.VOLUNTEER_ONLY;
}

export function getProjectTypeLabel(projectType) {
  return isVolunteerOnlyProject(projectType) ? "Tình nguyện" : "Gây quỹ";
}

export function getApprovedStatus(project) {
  return isVolunteerOnlyProject(project?.projectType)
    ? PROJECT_STATUS.RECRUITING
    : PROJECT_STATUS.FUNDING;
}

export function getResumeStatus(project) {
  return isVolunteerOnlyProject(project?.projectType)
    ? PROJECT_STATUS.RECRUITING
    : PROJECT_STATUS.FUNDING;
}

export function mapProjectStatusToUI(status) {
  const normalizedStatus = normalizeProjectStatus(status);

  if (LIVE_REAL_STATUSES.includes(normalizedStatus)) {
    return ADMIN_UI_PROJECT_STATUS.ACTIVE;
  }

  if (normalizedStatus === PROJECT_STATUS.UPDATING) {
    return ADMIN_UI_PROJECT_STATUS.UPDATING;
  }

  if (COMPLETED_REAL_STATUSES.includes(normalizedStatus)) {
    return ADMIN_UI_PROJECT_STATUS.COMPLETED;
  }

  if (CANCELLED_REAL_STATUSES.includes(normalizedStatus)) {
    return ADMIN_UI_PROJECT_STATUS.CANCELLED;
  }

  if (PENDING_REAL_STATUSES.includes(normalizedStatus)) {
    return ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL;
  }

  if (normalizedStatus === PROJECT_STATUS.PAUSED) {
    return ADMIN_UI_PROJECT_STATUS.PAUSED;
  }

  return null;
}

export function getAdminUIStatusLabel(uiStatus) {
  return ADMIN_UI_STATUS_LABELS[uiStatus] || uiStatus || "--";
}

export function getAdminUIStatusStyle(uiStatus) {
  return (
    ADMIN_UI_STATUS_STYLES[uiStatus] || {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      icon: "i",
    }
  );
}

export function getProjectStatusLabel(status) {
  const normalizedStatus = normalizeProjectStatus(status);
  return (
    ADMIN_PROJECT_STATUS_LABELS[normalizedStatus] || normalizedStatus || "--"
  );
}

export function getDropdownStatusLabel(status, projectType, options = {}) {
  const normalizedStatus = normalizeProjectStatus(status);
  const { isResume = false } = options;
  const volunteerOnly = isVolunteerOnlyProject(projectType);

  if (normalizedStatus === PROJECT_STATUS.FUNDING) {
    return isResume ? "Tiếp tục gây quỹ" : "Đang gây quỹ";
  }

  if (normalizedStatus === PROJECT_STATUS.RECRUITING) {
    if (volunteerOnly) {
      return isResume
        ? "Tiếp tục tuyển tình nguyện viên"
        : "Tuyển tình nguyện viên";
    }

    return isResume ? "Tiếp tục tuyển thành viên" : "Đang tuyển thành viên";
  }

  return (
    DROPDOWN_STATUS_LABELS[normalizedStatus] ||
    getProjectStatusLabel(normalizedStatus)
  );
}

export function shouldShowInAdminProjectList(project) {
  const normalizedStatus = normalizeProjectStatus(project?.status);

  return (
    REVIEWABLE_REAL_STATUSES.includes(normalizedStatus) ||
    MANAGEABLE_REAL_STATUSES.includes(normalizedStatus) ||
    COMPLETED_REAL_STATUSES.includes(normalizedStatus) ||
    CANCELLED_REAL_STATUSES.includes(normalizedStatus)
  );
}

export function isReviewableProjectStatus(status) {
  return REVIEWABLE_REAL_STATUSES.includes(normalizeProjectStatus(status));
}
