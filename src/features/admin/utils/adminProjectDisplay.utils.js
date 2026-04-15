import { ADMIN_UI_PROJECT_STATUS } from "./projectStatus.utils";

export const formatVnd = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

export const formatDate = (dateString, fallback = "Chưa có") => {
  if (!dateString) return fallback;

  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch {
    return String(dateString);
  }
};

export const formatDateOnly = (value, fallback = "--") => {
  if (!value) return fallback;

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export const getDaysRemaining = (endDate) => {
  if (!endDate) return null;

  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const resolveProjectTimelineState = (project, uiStatus = null) => {
  const daysRemaining = getDaysRemaining(project?.endDate);
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  return {
    daysRemaining,
    isExpired,
    showExpiredBadge:
      isExpired && uiStatus === ADMIN_UI_PROJECT_STATUS.ACTIVE,
  };
};

export const resolveProjectCoverUrl = (project) =>
  project?.coverMedia?.url ||
  project?.coverMedia?.secure_url ||
  (typeof project?.coverMedia === "string" ? project.coverMedia : null);

export const resolveProjectDocuments = (project) => {
  if (Array.isArray(project?.documentsMedia)) {
    return project.documentsMedia;
  }

  if (Array.isArray(project?.documents)) {
    return project.documents.filter(
      (item) => item && (typeof item === "object" ? item.url || item._id : item)
    );
  }

  return [];
};

export const resolveProjectDocumentsCount = (project) =>
  resolveProjectDocuments(project).length;

export const resolveProjectOrganizer = (project) =>
  project?.organizer || project?.organizerId || null;

export const resolveVolunteerSummary = (project) => {
  const volunteerRoles = Array.isArray(project?.volunteerRoles)
    ? project.volunteerRoles
    : [];

  const rolesCount = volunteerRoles.length;
  const currentVolunteers = Number(project?.stats?.currentVolunteers || 0);
  const targetVolunteers = Number(project?.stats?.targetVolunteers || 0);
  const hasVolunteerTarget = targetVolunteers > 0;

  const volunteerPercent = hasVolunteerTarget
    ? Math.min(
        Math.round((currentVolunteers / targetVolunteers) * 100),
        100
      )
    : 0;

  return {
    volunteerRoles,
    rolesCount,
    currentVolunteers,
    targetVolunteers,
    hasVolunteerTarget,
    volunteerPercent,
  };
};

export const resolveFundingSummary = (project) => {
  const currentAmount = Number(project?.currentAmount || 0);
  const targetAmount = Number(project?.targetAmount || 0);
  const isFundraising = targetAmount > 0;

  const fundsPercent = isFundraising
    ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
    : 0;

  return {
    currentAmount,
    targetAmount,
    isFundraising,
    fundsPercent,
  };
};

export const toDisplayValue = (value) => {
  if (value === null || value === undefined) return "--";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const normalized = String(value).trim();
    return normalized ? normalized : "--";
  }

  if (Array.isArray(value)) {
    try {
      return value.length
        ? value.map((item) => toDisplayValue(item)).join(", ")
        : "--";
    } catch {
      return "--";
    }
  }

  if (typeof value === "object") {
    if (typeof value?.address === "string" && value.address.trim()) {
      return value.address.trim();
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "--";
    }
  }

  return "--";
};

export const isImageLike = (url, mimetype) => {
  const type = String(mimetype || "").toLowerCase();
  if (type.includes("image/")) return true;

  const normalizedUrl = String(url || "").toLowerCase();
  if (normalizedUrl.includes("image/upload")) return true;

  return Boolean(normalizedUrl.match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i));
};

export const isPdfLike = (url, mimetype, name) => {
  const type = String(mimetype || "").toLowerCase();
  if (type.includes("application/pdf")) return true;

  const normalizedUrl = String(url || "").toLowerCase();
  const normalizedName = String(name || "").toLowerCase();

  return normalizedUrl.endsWith(".pdf") || normalizedName.endsWith(".pdf");
};