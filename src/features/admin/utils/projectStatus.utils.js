import { PROJECT_STATUS, PROJECT_TYPE } from "@/shared/constants/project";

export const ADMIN_UI_PROJECT_STATUS = {
  ACTIVE: "ACTIVE",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const ADMIN_PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.DRAFT]: "Draft",
  [PROJECT_STATUS.UNDER_REVIEW]: "Pending Review",
  [PROJECT_STATUS.PENDING_APPROVAL]: "Pending Review",
  [PROJECT_STATUS.REVISION_REQUESTED]: "Revision Requested",
  [PROJECT_STATUS.REJECTED]: "Rejected",

  [PROJECT_STATUS.FUNDING]: "Fundraising",
  [PROJECT_STATUS.RECRUITING]: "Recruiting Volunteers",
  [PROJECT_STATUS.EXECUTING]: "Executing",
  [PROJECT_STATUS.ACTIVE]: "Active",
  [PROJECT_STATUS.PAUSED]: "Paused",

  [PROJECT_STATUS.COMPLETED_SUCCESSFULLY]: "Completed",
  [PROJECT_STATUS.COMPLETED_PARTIAL]: "Partially Completed",

  [PROJECT_STATUS.CANCELLED_BY_PLATFORM]: "Cancelled",
  [PROJECT_STATUS.CANCELLED_BY_ORGANIZER]: "Cancelled",
  [PROJECT_STATUS.CANCELLED_FRAUD]: "Cancelled",

  DELETED: "Deleted",

  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ADMIN_UI_STATUS_LABELS = {
  [ADMIN_UI_PROJECT_STATUS.ACTIVE]: "Active",
  [ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL]: "Pending Review",
  [ADMIN_UI_PROJECT_STATUS.PAUSED]: "Paused",
  [ADMIN_UI_PROJECT_STATUS.COMPLETED]: "Completed",
  [ADMIN_UI_PROJECT_STATUS.CANCELLED]: "Cancelled",
};

export const ADMIN_UI_STATUS_STYLES = {
  [ADMIN_UI_PROJECT_STATUS.ACTIVE]: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "🟢",
  },
  [ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL]: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "🟡",
  },
  [ADMIN_UI_PROJECT_STATUS.PAUSED]: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: "⏸️",
  },
  [ADMIN_UI_PROJECT_STATUS.COMPLETED]: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "✅",
  },
  [ADMIN_UI_PROJECT_STATUS.CANCELLED]: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "❌",
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
  [PROJECT_STATUS.REVISION_REQUESTED]: "🟠 Revision Requested",
  [PROJECT_STATUS.REJECTED]: "❌ Rejected",
  [PROJECT_STATUS.PAUSED]: "⏸️ Paused",
  [PROJECT_STATUS.COMPLETED_SUCCESSFULLY]: "✅ Completed",
  [PROJECT_STATUS.COMPLETED_PARTIAL]: "✅ Partially Completed",

  // Action label trong dropdown phải là Cancel, không phải Cancelled
  [PROJECT_STATUS.CANCELLED_BY_PLATFORM]: "❌ Cancel",
  [PROJECT_STATUS.CANCELLED_BY_ORGANIZER]: "❌ Cancel",
  [PROJECT_STATUS.CANCELLED_FRAUD]: "❌ Cancel",

  [PROJECT_STATUS.PENDING_APPROVAL]: "🟡 Pending Review",
  [PROJECT_STATUS.UNDER_REVIEW]: "🟡 Pending Review",
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
  return isVolunteerOnlyProject(projectType) ? "Volunteer" : "Fundraising";
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
      icon: "📌",
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
    return isResume ? "🟢 Resume Fundraising" : "🟢 Fundraising";
  }

  if (normalizedStatus === PROJECT_STATUS.RECRUITING) {
    if (volunteerOnly) {
      return isResume
        ? "🟢 Resume Volunteer Recruiting"
        : "🟢 Volunteer Recruiting";
    }

    return isResume ? "🟢 Resume Recruiting" : "🟢 Recruiting";
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