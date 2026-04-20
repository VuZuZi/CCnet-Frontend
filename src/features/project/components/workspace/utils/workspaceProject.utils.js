import {
  formatProjectCurrency,
  getProjectFundingStats,
  getProjectMode,
  getProjectVolunteerStats,
} from "@/features/project/utils/projectDisplay.utils";

export const PAGE_SIZE = 10;
export const DRAFT_PAGE_SIZE = 6;

export const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export const TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả loại dự án" },
  { value: "FUNDED", label: "Dự án gây quỹ" },
  { value: "VOLUNTEER_ONLY", label: "Chỉ tình nguyện viên" },
];

export const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const getWorkspaceTypeLabel = (projectType) =>
  projectType === "VOLUNTEER_ONLY" ? "Chỉ tình nguyện viên" : "Dự án gây quỹ";

export const getVisiblePages = (currentPage, totalPages, windowSize = 5) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + windowSize - 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
};

export const filterWorkspaceProjects = ({
  projects = [],
  keyword = "",
  projectType = "ALL",
  volunteerMode = "ALL",
}) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return projects.filter((project) => {
    const { needsVolunteers } = getProjectMode(project);

    const matchesKeyword =
      !normalizedKeyword ||
      String(project?.title || "").toLowerCase().includes(normalizedKeyword) ||
      String(project?.category || "").toLowerCase().includes(normalizedKeyword) ||
      String(project?.location?.address || "").toLowerCase().includes(normalizedKeyword);

    const matchesType =
      projectType === "ALL" || String(project?.projectType || "") === projectType;

    const matchesVolunteerMode =
      volunteerMode === "ALL" ||
      (volunteerMode === "NEEDS" && needsVolunteers) ||
      (volunteerMode === "NO_NEEDS" && !needsVolunteers);

    return matchesKeyword && matchesType && matchesVolunteerMode;
  });
};

export const filterWorkspaceDraftProjects = ({
  projects = [],
  keyword = "",
  draftType = "ALL",
}) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return projects.filter((draft) => {
    const matchesKeyword =
      !normalizedKeyword ||
      String(draft?.title || "").toLowerCase().includes(normalizedKeyword) ||
      String(draft?.category || "").toLowerCase().includes(normalizedKeyword) ||
      String(draft?.location?.address || "").toLowerCase().includes(normalizedKeyword);

    const matchesType =
      draftType === "ALL" || String(draft?.projectType || "") === draftType;

    return matchesKeyword && matchesType;
  });
};

export const buildWorkspaceSummary = ({
  filteredProjects = [],
  draftProjects = [],
}) => {
  const totals = {
    total: filteredProjects.length,
    active: 0,
    pending: 0,
    draft: draftProjects.length,
    raised: 0,
    target: 0,
    volunteerTarget: 0,
    volunteerCurrent: 0,
  };

  filteredProjects.forEach((project) => {
    const normalizedStatus = String(project?.status || "");
    const { currentAmount, targetAmount } = getProjectFundingStats(project);
    const { currentVolunteers, targetVolunteers } = getProjectVolunteerStats(project);

    if (normalizedStatus === "ACTIVE") totals.active += 1;
    if (normalizedStatus === "PENDING_APPROVAL") totals.pending += 1;

    totals.raised += Number(currentAmount || 0);
    totals.target += Number(targetAmount || 0);
    totals.volunteerCurrent += Number(currentVolunteers || 0);
    totals.volunteerTarget += Number(targetVolunteers || 0);
  });

  return totals;
};

export const paginateItems = (items = [], currentPage = 1, pageSize = 10) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const start = (activePage - 1) * pageSize;

  return {
    totalPages,
    activePage,
    items: items.slice(start, start + pageSize),
  };
};

export const formatWorkspaceMoney = (value) =>
  `${formatProjectCurrency(value)}đ`;

export const getWorkspaceProjectCoverUrl = (project) => {
  if (project?.coverMedia?.url) return project.coverMedia.url;

  if (Array.isArray(project?.coverMedia) && project.coverMedia[0]?.url) {
    return project.coverMedia[0].url;
  }

  return null;
};