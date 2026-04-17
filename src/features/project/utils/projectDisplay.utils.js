export const normalizeProjectId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return String(value._id || value.id || value.userId || value.toString?.() || "");
  }
  return "";
};

export const safeProjectNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeProjectText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const stripProjectHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const formatProjectCurrency = (value) =>
  safeProjectNumber(value).toLocaleString("vi-VN");

export const formatProjectCurrencyVND = (value) =>
  `${safeProjectNumber(value).toLocaleString("vi-VN")}đ`;

export const formatProjectDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
};

export const formatProjectPostedDate = (dateString) => {
  if (!dateString) return "Không rõ ngày đăng";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Không rõ ngày đăng";

  const now = new Date();
  const diffMs = now - date;
  const oneHourMs = 60 * 60 * 1000;

  if (diffMs < oneHourMs) {
    return "Vừa đăng";
  }

  const datePart = date.toLocaleDateString("vi-VN");
  const timePart = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} • ${timePart}`;
};

export const getProjectDaysLeft = (endDate) => {
  if (!endDate) return null;

  const endTime = new Date(endDate).getTime();
  if (Number.isNaN(endTime)) return null;

  return Math.ceil((endTime - Date.now()) / (1000 * 60 * 60 * 24));
};

export const getProjectCategoryLabel = (category) => {
  const map = {
    Y_TE: "Y tế",
    GIAO_DUC: "Giáo dục",
    MOI_TRUONG: "Môi trường",
    THIEN_TAI: "Thiên tai",
    XAY_DUNG: "Xây dựng",
    KHAC: "Khác",
  };

  return map[category] || "Khác";
};

export const getProjectCategoryStyles = (category) => {
  const styles = {
    Y_TE: "bg-card-blue-bg text-blue-800",
    GIAO_DUC: "bg-card-purple-bg text-purple-800",
    MOI_TRUONG: "bg-card-green-bg text-green-800",
    THIEN_TAI: "bg-red-50 text-red-800",
    XAY_DUNG: "bg-card-yellow-bg text-amber-800",
    KHAC: "bg-slate-100 text-slate-800",
  };

  return styles[category] || "bg-slate-100 text-slate-800";
};

export const getProjectCardColors = (category) => {
  const colorByCategory = {
    Y_TE: {
      bg: "bg-card-blue-bg",
      border: "border-blue-100",
      text: "text-blue-900",
      barBg: "bg-blue-200",
      barFill: "bg-blue-500",
      icon: "text-blue-600",
    },
    GIAO_DUC: {
      bg: "bg-card-purple-bg",
      border: "border-purple-100",
      text: "text-purple-900",
      barBg: "bg-purple-200",
      barFill: "bg-purple-500",
      icon: "text-purple-600",
    },
    MOI_TRUONG: {
      bg: "bg-card-green-bg",
      border: "border-green-100",
      text: "text-green-900",
      barBg: "bg-green-200",
      barFill: "bg-green-500",
      icon: "text-green-600",
    },
    THIEN_TAI: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-900",
      barBg: "bg-red-200",
      barFill: "bg-red-500",
      icon: "text-red-600",
    },
    XAY_DUNG: {
      bg: "bg-card-yellow-bg",
      border: "border-amber-100",
      text: "text-amber-900",
      barBg: "bg-amber-200",
      barFill: "bg-amber-500",
      icon: "text-amber-600",
    },
    KHAC: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-900",
      barBg: "bg-slate-200",
      barFill: "bg-slate-500",
      icon: "text-slate-600",
    },
  };

  return colorByCategory[category] || colorByCategory.KHAC;
};

export const getProjectImage = (project) => {
  if (project?.coverMedia?.url) return project.coverMedia.url;
  if (Array.isArray(project?.coverMedia) && project?.coverMedia[0]?.url) {
    return project.coverMedia[0].url;
  }

  return "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1600&auto=format&fit=crop";
};

export const getProjectMode = (project) => {
  const isVolunteerOnly = project?.projectType === "VOLUNTEER_ONLY";
  const isFunded = project?.projectType === "FUNDED" || !project?.projectType;
  const needsVolunteers = Boolean(project?.needsVolunteers || isVolunteerOnly);

  return {
    isVolunteerOnly,
    isFunded,
    needsVolunteers,
    isMixedProject: isFunded && needsVolunteers,
    isVolunteerProject: isVolunteerOnly || needsVolunteers,
    isFundedProject: isFunded,
  };
};

export const getProjectFundingStats = (project) => {
  const currentAmount = safeProjectNumber(
    project?.financialDetail?.availableBalance ??
      project?.currentAmount ??
      project?.stats?.raisedAmount ??
      project?.stats?.currentAmount ??
      0
  );

  const targetAmount = safeProjectNumber(
    project?.targetAmount ?? project?.stats?.targetAmount ?? 0
  );

  const fundingPercent =
    targetAmount > 0
      ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
      : 0;

  return {
    currentAmount,
    targetAmount,
    fundingPercent,
    raisedAmount: currentAmount,
    percent: fundingPercent,
    isComplete: targetAmount > 0 && currentAmount >= targetAmount,
  };
};

export const getProjectVolunteerStats = (project) => {
  const currentVolunteers = safeProjectNumber(
    project?.stats?.currentVolunteers ??
      project?.stats?.volunteerJoined ??
      project?.stats?.volunteerCount ??
      project?.volunteerCount ??
      0
  );

  const targetVolunteers =
    safeProjectNumber(
      project?.stats?.targetVolunteers ?? project?.stats?.volunteerNeeded ?? 0
    ) ||
    safeProjectNumber(
      Array.isArray(project?.volunteerRoles)
        ? project.volunteerRoles.reduce(
            (sum, role) => sum + safeProjectNumber(role?.quantity),
            0
          )
        : 0
    );

  const volunteerPercent =
    targetVolunteers > 0
      ? Math.min(Math.round((currentVolunteers / targetVolunteers) * 100), 100)
      : 0;

  const isVolunteerFull =
    Boolean(project?.isVolunteerFull) ||
    (targetVolunteers > 0 && currentVolunteers >= targetVolunteers);

  return {
    currentVolunteers,
    targetVolunteers,
    volunteerPercent,
    isVolunteerFull,
    current: currentVolunteers,
    target: targetVolunteers,
    percent: volunteerPercent,
    isFull: isVolunteerFull,
    volunteerNeeded: targetVolunteers,
    volunteerJoined: currentVolunteers,
    volunteerProgress: volunteerPercent,
  };
};

export const isProjectFundingCompleted = (project) => {
  const { currentAmount, targetAmount, fundingPercent } = getProjectFundingStats(project);
  const normalizedStatus = String(project?.status || "").toUpperCase();

  return (
    (targetAmount > 0 && currentAmount >= targetAmount) ||
    fundingPercent >= 100 ||
    normalizedStatus === "COMPLETED_SUCCESSFULLY" ||
    normalizedStatus === "COMPLETED_PARTIAL"
  );
};

export const isProjectClosed = (project) => {
  const normalizedStatus = String(project?.status || "").toUpperCase();

  return [
    "COMPLETED",
    "CLOSED",
    "CANCELLED",
    "COMPLETED_SUCCESSFULLY",
    "COMPLETED_PARTIAL",
    "CANCELLED_BY_PLATFORM",
    "CANCELLED_BY_ORGANIZER",
    "CANCELLED_FRAUD",
    "FAILED_EXECUTION",
  ].includes(normalizedStatus);
};

export const getCurrentUserProjectApplicationStatus = (project) => {
  const candidates = [
    project?.currentUserParticipation?.volunteerStatus,
    project?.currentUserParticipation?.status,
    project?.currentUserVolunteer?.status,
    project?.myVolunteerApplication?.status,
    project?.myApplication?.status,
    project?.applicationStatus,
    project?.volunteerStatus,
  ];

  const matched = candidates.find((value) => value !== null && value !== undefined);
  return String(matched || "").trim().toUpperCase();
};

export const getProjectPrimaryAction = ({
  project,
  currentUserId,
  navigate,
  isOwner,
}) => {
  const projectId = normalizeProjectId(project?._id || project?.id);
  const { isVolunteerOnly, isVolunteerProject, isFundedProject } =
    getProjectMode(project);
  const { fundingPercent } = getProjectFundingStats(project);
  const { volunteerPercent } = getProjectVolunteerStats(project);

  const closed = isProjectClosed(project);
  const isVolunteerFull =
    Boolean(project?.isVolunteerFull) || volunteerPercent >= 100;
  const isFundingReached = fundingPercent >= 100;
  const currentUserApplicationStatus =
    getCurrentUserProjectApplicationStatus(project);

  if (isOwner) {
    return {
      label: "Quản lý",
      className: "bg-slate-900 text-white hover:bg-slate-800",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (currentUserApplicationStatus === "WITHDRAW_REQUESTED") {
    return {
      label: "Đang chờ rút",
      className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (currentUserApplicationStatus === "APPROVED") {
    return {
      label: "Đang tham gia",
      className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (currentUserApplicationStatus === "PENDING") {
    return {
      label: "Đang chờ duyệt",
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (closed || isVolunteerFull || isFundingReached) {
    return {
      label: "Xem chi tiết",
      className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (isFundedProject) {
    return {
      label: "Đóng góp",
      className: "bg-amber-400 text-slate-900 hover:bg-amber-500",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (isVolunteerOnly || isVolunteerProject) {
    return {
      label: "Tham gia",
      className: "bg-emerald-500 text-white hover:bg-emerald-600",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  return {
    label: "Xem chi tiết",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    onClick: () => navigate(`/projects/${projectId}`),
  };
};

export const scoreFeaturedProject = (project) => {
  const { isVolunteerProject, isFundedProject } = getProjectMode(project);
  const { fundingPercent } = getProjectFundingStats(project);
  const { volunteerPercent } = getProjectVolunteerStats(project);

  const closed = isProjectClosed(project);
  const isVolunteerFull = Boolean(project?.isVolunteerFull) || volunteerPercent >= 100;
  const isFundingReached = fundingPercent >= 100;
  const isOpen = !closed && !isVolunteerFull && !isFundingReached;

  const isUrgent = Boolean(project?.isUrgent);
  const daysLeft = getProjectDaysLeft(project?.endDate);
  const isEndingSoon =
    typeof daysLeft === "number" && daysLeft >= 0 && daysLeft <= 14;
  const isNearlyFunded = fundingPercent >= 70 && fundingPercent < 100;
  const isNearlyFullVolunteer = volunteerPercent >= 70 && volunteerPercent < 100;

  let score = 0;

  if (isOpen) score += 100;
  if (isUrgent) score += 120;
  if (isEndingSoon) score += 70;
  if (isFundedProject) score += 60;
  if (isVolunteerProject) score += 40;
  if (isNearlyFunded) score += 90;
  if (isNearlyFullVolunteer) score += 70;

  score += Math.min(fundingPercent, 100);
  score += Math.min(volunteerPercent, 100) * 0.5;

  return score;
};

export const mergeUniqueProjects = (primaryProjects = [], extraProjects = []) => {
  const map = new Map();

  [...primaryProjects, ...extraProjects].forEach((project) => {
    const id = normalizeProjectId(project?._id || project?.id);
    if (!id) return;
    if (!map.has(id)) {
      map.set(id, project);
    }
  });

  return Array.from(map.values());
};

export const extractFollowingList = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.following)) return payload.following;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.docs)) return payload.docs;

  if (Array.isArray(payload?.data?.following)) return payload.data.following;
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.docs)) return payload.data.docs;

  return [];
};

export const extractFollowedOrganizerId = (item) =>
  normalizeProjectId(
    item?.followingId?._id ||
      item?.followingId?.id ||
      item?.followingId ||
      item?.user?._id ||
      item?.user?.id ||
      item?.userId?._id ||
      item?.userId?.id ||
      item?.userId ||
      item?._id ||
      item?.id
  );

export const matchesProjectFilters = (project, filters, followedOrganizerIds) => {
  if (!project) return false;

  const organizerId = normalizeProjectId(project?.organizerId);
  const followedSet = new Set((followedOrganizerIds || []).filter(Boolean));

  if (filters.organizerScope === "FOLLOWED") {
    if (!organizerId || !followedSet.has(organizerId)) {
      return false;
    }
  }

  if (filters.category && project?.category !== filters.category) {
    return false;
  }

  const keyword = normalizeProjectText(filters.location);
  if (keyword) {
    const locationText = normalizeProjectText(project?.location?.address || "");
    if (!locationText.includes(keyword)) {
      return false;
    }
  }

  return true;
};

export const buildVisibleProjects = ({
  projects,
  featuredProject,
  filters,
  followedOrganizerIds,
}) => {
  const followedSet = new Set((followedOrganizerIds || []).filter(Boolean));
  const seen = new Set();
  const result = [];

  const pushUnique = (project) => {
    if (!project) return;
    const id = normalizeProjectId(project?._id || project?.id);
    if (!id || seen.has(id)) return;
    seen.add(id);
    result.push(project);
  };

  const filteredProjects = (projects || []).filter((project) =>
    matchesProjectFilters(project, filters, followedOrganizerIds)
  );

  const followedProjects = filteredProjects.filter((project) => {
    const organizerId = normalizeProjectId(project?.organizerId);
    return organizerId && followedSet.has(organizerId);
  });

  const otherProjects = filteredProjects.filter((project) => {
    const organizerId = normalizeProjectId(project?.organizerId);
    return !organizerId || !followedSet.has(organizerId);
  });

  const featuredMatches = matchesProjectFilters(
    featuredProject,
    filters,
    followedOrganizerIds
  );

  if (filters.organizerScope === "FOLLOWED") {
    followedProjects.forEach(pushUnique);
    if (featuredMatches) pushUnique(featuredProject);
    return result;
  }

  followedProjects.forEach(pushUnique);
  if (featuredMatches) pushUnique(featuredProject);
  otherProjects.forEach(pushUnique);

  return result;
};