import {
  getProjectCategoryLabel,
  getProjectFundingStats,
  getProjectVolunteerStats,
  normalizeProjectId,
  safeProjectNumber,
  stripProjectHtml,
} from "./projectDisplay.utils";

export const VIETNAM_MAP_BOUNDS = [
  [8.18, 102.14],
  [23.45, 109.55],
];

export const VIETNAM_MAP_CENTER = [16.2, 106.2];
export const VIETNAM_DEFAULT_ZOOM = 6;
export const MAP_PROJECT_MODE_SWITCH_ZOOM = 9;

export const buildMapViewportParams = (bounds, zoom, filters = {}) => {
  if (!bounds) return null;

  return {
    north: Number(bounds.north.toFixed(5)),
    south: Number(bounds.south.toFixed(5)),
    east: Number(bounds.east.toFixed(5)),
    west: Number(bounds.west.toFixed(5)),
    zoom: Math.max(1, Math.round(Number(zoom) || VIETNAM_DEFAULT_ZOOM)),
    category: filters.category || undefined,
    organizerScope: filters.organizerScope || undefined,
    search: filters.search || undefined,
  };
};

export const getProjectCoordinates = (project) => {
  const coordinates = project?.location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const [longitude, latitude] = coordinates.map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    latitude,
    longitude,
  };
};

export const normalizeMapProjectItem = (project) => {
  const projectId = normalizeProjectId(
    project?._id || project?.id || project?.projectId
  );
  const coords = getProjectCoordinates(project);

  if (!projectId || !coords) return null;

  const { fundingPercent, currentAmount, targetAmount } =
    getProjectFundingStats(project);
  const { volunteerPercent, currentVolunteers, targetVolunteers } =
    getProjectVolunteerStats(project);

  return {
    type: "project",
    projectId,
    title: project?.title || "Dự án",
    category: project?.category || "KHAC",
    categoryLabel: getProjectCategoryLabel(project?.category),
    coverImage: project?.coverMedia?.url || "/placeholder-project.jpg",
    summary:
      stripProjectHtml(project?.summary || project?.description || "") ||
      "Dự án đang chờ bạn khám phá.",
    address: project?.location?.address || "Chưa cập nhật địa điểm",
    latitude: coords.latitude,
    longitude: coords.longitude,
    currentAmount,
    targetAmount,
    fundingPercent,
    currentVolunteers,
    targetVolunteers,
    volunteerPercent,
    needsVolunteers: Boolean(project?.needsVolunteers),
    isUrgent: Boolean(project?.isUrgent),
    organizer: project?.organizerId || null,
    raw: project,
  };
};

export const normalizeClusterItem = (cluster) => {
  const latitude = Number(cluster?.latitude);
  const longitude = Number(cluster?.longitude);
  const count = safeProjectNumber(cluster?.count);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || count <= 0) {
    return null;
  }

  return {
    type: "cluster",
    clusterId:
      cluster?.clusterId ||
      `${cluster?.gridKey || "cluster"}-${latitude}-${longitude}-${count}`,
    latitude,
    longitude,
    count,
    sampleCategory: cluster?.sampleCategory || "KHAC",
    sampleTitle: cluster?.sampleTitle || "",
    sampleAddress: cluster?.sampleAddress || "",
    expandZoom: safeProjectNumber(cluster?.expandZoom, MAP_PROJECT_MODE_SWITCH_ZOOM),
  };
};

export const normalizeProjectMapResponse = (response) => {
  const items = Array.isArray(response?.items) ? response.items : [];
  const panelProjects = Array.isArray(response?.panelProjects)
    ? response.panelProjects
    : [];

  const normalizedItems = items
    .map((item) =>
      item?.type === "cluster"
        ? normalizeClusterItem(item)
        : normalizeMapProjectItem(item)
    )
    .filter(Boolean);

  const normalizedPanelProjects = panelProjects
    .map(normalizeMapProjectItem)
    .filter(Boolean);

  return {
    mode: response?.mode === "cluster" ? "cluster" : "project",
    items: normalizedItems,
    panelProjects: normalizedPanelProjects,
    summary: {
      totalVisible: safeProjectNumber(response?.summary?.totalVisible),
      itemCount: safeProjectNumber(response?.summary?.itemCount),
      projectCount: safeProjectNumber(response?.summary?.projectCount),
      clusterCount: safeProjectNumber(response?.summary?.clusterCount),
      zoom: safeProjectNumber(response?.summary?.zoom, VIETNAM_DEFAULT_ZOOM),
    },
  };
};

export const getClusterBadgeSizeClass = (count = 0) => {
  if (count >= 100) return "h-[58px] w-[58px] text-[16px]";
  if (count >= 30) return "h-[53px] w-[53px] text-[15px]";
  if (count >= 10) return "h-[48px] w-[48px] text-[14px]";
  if (count >= 5) return "h-[44px] w-[44px] text-[13px]";
  return "h-[40px] w-[40px] text-[12px]";
};

export const getClusterIconPixelSize = (count = 0) => {
  if (count >= 100) return 74;
  if (count >= 30) return 68;
  if (count >= 10) return 62;
  if (count >= 5) return 58;
  return 54;
};

export const formatVisibleSummaryText = (summary, mode) => {
  if (mode === "cluster") {
    return `${summary.clusterCount} cụm • ${summary.totalVisible} dự án trong vùng nhìn thấy`;
  }

  return `${summary.projectCount} dự án trong vùng nhìn thấy`;
};

export const isProjectItem = (item) => item?.type === "project";
export const isClusterItem = (item) => item?.type === "cluster";