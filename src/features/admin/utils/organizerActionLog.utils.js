import { CheckCircle2, Clock3, History } from "lucide-react";

export const PAGE_SIZE = 10;

export const ACTION_LABELS = {
  APPROVE_ORGANIZER_REQUEST: "Approve request",
  DECLINE_ORGANIZER_REQUEST: "Decline request",
};

export const ACTION_STYLES = {
  APPROVE_ORGANIZER_REQUEST:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  DECLINE_ORGANIZER_REQUEST: "border-rose-200 bg-rose-50 text-rose-700",
};

export const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "APPROVE_ORGANIZER_REQUEST", label: "Approve request" },
  { value: "DECLINE_ORGANIZER_REQUEST", label: "Decline request" },
];

export const getActionIconComponent = (action) => {
  switch (action) {
    case "APPROVE_ORGANIZER_REQUEST":
      return CheckCircle2;
    case "DECLINE_ORGANIZER_REQUEST":
      return Clock3;
    default:
      return History;
  }
};

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

export const buildVisiblePages = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];
  return [1, current - 1, current, current + 1, total];
};

export const normalizeLogsResponse = (payload) => ({
  items: payload?.items || [],
  pagination: payload?.pagination || {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  },
});