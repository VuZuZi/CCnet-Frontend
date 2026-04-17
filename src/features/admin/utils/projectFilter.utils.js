import {
  ADMIN_UI_PROJECT_STATUS,
  mapProjectStatusToUI,
  shouldShowInAdminProjectList,
} from "./projectStatus.utils";

export function stripHtml(value) {
  if (!value) return "";
  return String(value).replace(/<[^>]*>/g, "").trim();
}

export function toSearchableText(value) {
  if (value === null || value === undefined) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => toSearchableText(item)).join(" ");
  }

  if (typeof value === "object") {
    if (typeof value.address === "string") {
      return value.address;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
}

export function buildProjectSearchText(project) {
  const organizer = project?.organizer || project?.organizerId || null;

  return [
    toSearchableText(project?._id),
    toSearchableText(project?.title),
    stripHtml(project?.description),
    toSearchableText(project?.status),
    toSearchableText(project?.location),
    toSearchableText(organizer?._id),
    toSearchableText(organizer?.fullName),
    toSearchableText(organizer?.email),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesProjectSearch(project, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return true;

  return buildProjectSearchText(project).includes(normalizedQuery);
}

export function getAdminVisibleProjects(projects) {
  return Array.isArray(projects)
    ? projects.filter(shouldShowInAdminProjectList)
    : [];
}

export function filterAdminProjects(projects, filterStatus = "ALL", searchText = "") {
  const adminProjects = getAdminVisibleProjects(projects);

  const byStatus =
    filterStatus === "ALL"
      ? adminProjects
      : adminProjects.filter(
          (project) => mapProjectStatusToUI(project?.status) === filterStatus
        );

  return byStatus.filter((project) => matchesProjectSearch(project, searchText));
}

export function getAdminProjectStats(projects) {
  const adminProjects = getAdminVisibleProjects(projects);

  return {
    total: adminProjects.length,
    [ADMIN_UI_PROJECT_STATUS.ACTIVE]: adminProjects.filter(
      (project) =>
        mapProjectStatusToUI(project?.status) === ADMIN_UI_PROJECT_STATUS.ACTIVE
    ).length,
    [ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL]: adminProjects.filter(
      (project) =>
        mapProjectStatusToUI(project?.status) ===
        ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL
    ).length,
    [ADMIN_UI_PROJECT_STATUS.PAUSED]: adminProjects.filter(
      (project) =>
        mapProjectStatusToUI(project?.status) === ADMIN_UI_PROJECT_STATUS.PAUSED
    ).length,
    [ADMIN_UI_PROJECT_STATUS.COMPLETED]: adminProjects.filter(
      (project) =>
        mapProjectStatusToUI(project?.status) === ADMIN_UI_PROJECT_STATUS.COMPLETED
    ).length,
    [ADMIN_UI_PROJECT_STATUS.CANCELLED]: adminProjects.filter(
      (project) =>
        mapProjectStatusToUI(project?.status) === ADMIN_UI_PROJECT_STATUS.CANCELLED
    ).length,
  };
}