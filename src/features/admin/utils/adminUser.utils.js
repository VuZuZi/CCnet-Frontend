export const USER_PAGE_SIZE = 6;

export const USER_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "BANNED", label: "Banned" },
];

export const getInitials = (name) => {
  if (!name) return "US";

  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const normalizeUserStatus = (user) => {
  const rawStatus = String(user?.status || "").trim().toLowerCase();

  if (rawStatus === "banned") return "banned";
  if (rawStatus === "inactive") return "inactive";
  if (rawStatus === "active") return "active";
  if (user?.isActive === false) return "banned";

  return "active";
};

export const getStatusMeta = (status) => {
  switch (status) {
    case "banned":
      return {
        label: "Banned",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "inactive":
      return {
        label: "Inactive",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "active":
    default:
      return {
        label: "Active",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
  }
};

export const getRoleClass = (role) => {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "admin") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (normalized === "organizer") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
};

export const formatDateTime = (value) => {
  if (!value) return "--";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
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

export const normalizeUsersResponse = (res, fallbackLimit = USER_PAGE_SIZE) => {
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

export const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallback;