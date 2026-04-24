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
  APPROVE_PROJECT: "Phê duyệt dự án",
  REQUEST_PROJECT_REVISION: "Yêu cầu chỉnh sửa",
  REJECT_PROJECT: "Từ chối dự án",
  REQUEST_PROJECT_UPDATE: "Yêu cầu cập nhật",
  PAUSE_PROJECT: "Tạm dừng dự án",
  RESUME_PROJECT: "Tiếp tục dự án",
  COMPLETE_PROJECT: "Hoàn thành dự án",
  CANCEL_PROJECT: "Hủy dự án",
  DELETE_PROJECT: "Xóa dự án",
  UPDATE_PROJECT_STATUS: "Cập nhật trạng thái",
};

const PROJECT_HISTORY_STATUS_LABEL_OVERRIDES = {
  DRAFT: "Bản nháp",
  UNDER_REVIEW: "Chờ kiểm duyệt",
  PENDING_APPROVAL: "Chờ kiểm duyệt",
  REVISION_REQUESTED: "Yêu cầu chỉnh sửa",
  REJECTED: "Đã từ chối",

  FUNDING: "Đang gây quỹ",
  RECRUITING: "Đang tuyển tình nguyện viên",
  EXECUTING: "Đang thực hiện",
  ACTIVE: "Đang hoạt động",
  UPDATING: "Đang cập nhật",
  PAUSED: "Tạm dừng",

  COMPLETED_SUCCESSFULLY: "Đã hoàn thành",
  COMPLETED_PARTIAL: "Hoàn thành một phần",
  COMPLETED: "Đã hoàn thành",

  CANCELLED_BY_PLATFORM: "Đã hủy",
  CANCELLED_BY_ORGANIZER: "Đã hủy",
  CANCELLED_FRAUD: "Đã hủy",
  CANCELLED: "Đã hủy",

  DELETED: "Đã xóa",
};

const PROJECT_TYPE_LABEL_OVERRIDES = {
  FUNDING: "Gây quỹ",
  FUNDED: "Gây quỹ",
  FUNDRAISING: "Gây quỹ",
  VOLUNTEER: "Tình nguyện",
  VOLUNTEER_ONLY: "Tình nguyện",
  HYBRID: "Kết hợp",
};

export const PROJECT_HISTORY_ACTION_OPTIONS = [
  { value: "", label: "Tất cả hành động" },
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
    return new Intl.DateTimeFormat("vi-VN", {
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
