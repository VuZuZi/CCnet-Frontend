import { Ban, CheckCircle2, History } from "lucide-react";

export const ADMIN_ACTION_LOG_PAGE_SIZE = 10;

export const ACTION_LABELS = {
  BAN_USER: "Ban user",
  UNBAN_USER: "Unban user",
  UPDATE_USER_STATUS: "Update user status",
};

export const ACTION_STYLES = {
  BAN_USER: "border-red-200 bg-red-50 text-red-700",
  UNBAN_USER: "border-emerald-200 bg-emerald-50 text-emerald-700",
  UPDATE_USER_STATUS: "border-amber-200 bg-amber-50 text-amber-700",
};

export const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "BAN_USER", label: "Ban user" },
  { value: "UNBAN_USER", label: "Unban user" },
  { value: "UPDATE_USER_STATUS", label: "Update user status" },
];

export const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallback;

export const formatDateTimeSingleLine = (value) => {
  if (!value) return "--";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export const normalizeLogsResponse = (
  res,
  fallbackLimit = ADMIN_ACTION_LOG_PAGE_SIZE
) => {
  const payload = res?.data?.data ?? res?.data ?? {};

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: {
        page: 1,
        limit: fallbackLimit,
        total: payload.length,
        totalPages: 1,
      },
    };
  }

  return {
    items: payload?.items || [],
    pagination: payload?.pagination || {
      page: 1,
      limit: fallbackLimit,
      total: 0,
      totalPages: 1,
    },
  };
};

export const getActionIconComponent = (action) => {
  switch (action) {
    case "BAN_USER":
      return Ban;
    case "UNBAN_USER":
      return CheckCircle2;
    default:
      return History;
  }
};

export const buildVisiblePages = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];

  return [1, current - 1, current, current + 1, total];
};