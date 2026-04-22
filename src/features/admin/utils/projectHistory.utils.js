import {
  ADMIN_PROJECT_ACTION_LABELS,
  getProjectActionBadgeClass,
  getProjectActionLabel,
} from "./projectAction.utils";
import { getProjectStatusLabel } from "./projectStatus.utils";

const PROJECT_HISTORY_ACTION_ORDER = [
  "APPROVE_PROJECT",
  "REQUEST_PROJECT_REVISION",
  "REJECT_PROJECT",
  "REQUEST_PROJECT_UPDATE",
  "PAUSE_PROJECT",
  "RESUME_PROJECT",
  "COMPLETE_PROJECT",
  "CANCEL_PROJECT",
  "DELETE_PROJECT",
  "UPDATE_PROJECT_STATUS",
];

const PROJECT_HISTORY_ACTION_LABEL_OVERRIDES = {
  APPROVE_PROJECT: "Approve Project",
  REQUEST_PROJECT_REVISION: "Request Revision",
  REJECT_PROJECT: "Reject Project",
  REQUEST_PROJECT_UPDATE: "Request Update",
  PAUSE_PROJECT: "Pause Project",
  RESUME_PROJECT: "Resume Project",
  COMPLETE_PROJECT: "Complete Project",
  CANCEL_PROJECT: "Cancel Project",
  DELETE_PROJECT: "Delete Project",
  UPDATE_PROJECT_STATUS: "Update Status",
};

const PROJECT_HISTORY_STATUS_LABEL_OVERRIDES = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Pending Review",
  PENDING_APPROVAL: "Pending Review",
  REVISION_REQUESTED: "Revision Requested",
  REJECTED: "Rejected",

  FUNDING: "Fundraising",
  RECRUITING: "Recruiting Volunteers",
  EXECUTING: "Executing",
  ACTIVE: "Active",
  UPDATING: "Updating",
  PAUSED: "Paused",

  COMPLETED_SUCCESSFULLY: "Completed",
  COMPLETED_PARTIAL: "Partially Completed",
  COMPLETED: "Completed",

  CANCELLED_BY_PLATFORM: "Cancelled",
  CANCELLED_BY_ORGANIZER: "Cancelled",
  CANCELLED_FRAUD: "Cancelled",
  CANCELLED: "Cancelled",

  DELETED: "Deleted",
};

const PROJECT_TYPE_LABEL_OVERRIDES = {
  FUNDING: "Fundraising",
  FUNDED: "Fundraising",
  FUNDRAISING: "Fundraising",
  VOLUNTEER: "Volunteer",
  VOLUNTEER_ONLY: "Volunteer",
  HYBRID: "Hybrid",
};

export const PROJECT_HISTORY_ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  ...PROJECT_HISTORY_ACTION_ORDER.map((actionKey) => ({
    value: actionKey,
    label:
      PROJECT_HISTORY_ACTION_LABEL_OVERRIDES[actionKey] ||
      ADMIN_PROJECT_ACTION_LABELS[actionKey] ||
      actionKey,
  })),
];

export const formatProjectHistoryDateTime = (value) => {
  if (!value) return "--";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export const getProjectHistoryActionLabel = (action) => {
  const normalized = String(action || "").trim().toUpperCase();

  return (
    PROJECT_HISTORY_ACTION_LABEL_OVERRIDES[normalized] ||
    getProjectActionLabel(normalized) ||
    normalized ||
    "Action"
  );
};

export const getProjectHistoryActionBadgeClass = (action) =>
  getProjectActionBadgeClass(action);

export const getProjectHistoryStatusLabel = (status) => {
  const normalized = String(status || "").trim().toUpperCase();

  return (
    PROJECT_HISTORY_STATUS_LABEL_OVERRIDES[normalized] ||
    getProjectStatusLabel(normalized) ||
    normalized ||
    "--"
  );
};

export const getProjectHistoryProjectTypeLabel = (projectType) => {
  const normalized = String(projectType || "").trim().toUpperCase();

  return PROJECT_TYPE_LABEL_OVERRIDES[normalized] || normalized || "--";
};

export const normalizeProjectHistoryLogResponse = (res) => {
  const payload = res?.data?.data ?? res?.data ?? {};

  const rawItems = Array.isArray(payload?.items) ? payload.items : [];

  return {
    items: rawItems.map((item) => ({
      ...item,
      _id:
        item?._id ||
        item?.id ||
        `${item?.targetId || ""}-${item?.createdAt || ""}`,
      action: item?.action || "",
      actorName:
        item?.actorName ||
        item?.adminName ||
        item?.performedBy?.fullName ||
        item?.actor?.fullName ||
        "",
      actorEmail:
        item?.actorEmail ||
        item?.adminEmail ||
        item?.performedBy?.email ||
        item?.actor?.email ||
        "",
      previousStatus:
        item?.previousStatus ||
        item?.oldStatus ||
        item?.fromStatus ||
        "",
      nextStatus:
        item?.nextStatus ||
        item?.newStatus ||
        item?.toStatus ||
        "",
      reason: item?.reason || item?.note || "",
      createdAt: item?.createdAt || item?.updatedAt || "",
      projectTitle:
        item?.projectTitle ||
        item?.targetTitle ||
        item?.project?.title ||
        "",
      projectType:
        item?.projectType ||
        item?.project?.projectType ||
        item?.targetTypeLabel ||
        "",
      targetIdString:
        item?.targetIdString ||
        item?.targetId ||
        item?.projectId ||
        "",
    })),
    pagination: payload?.pagination || {
      page: 1,
      limit: 8,
      total: 0,
      totalPages: 1,
    },
  };
};
