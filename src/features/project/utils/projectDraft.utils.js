import DOMPurify from "dompurify";

export const getDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateForInput = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
};

export const toIsoOrNull = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
};

export const sanitizeHtml = (value) => {
  const raw = String(value || "");
  return raw ? DOMPurify.sanitize(raw) : "";
};

export const getProjectTierLimits = (tier) => {
  switch (tier) {
    case 3:
      return {
        maxDurationDays: 90,
        maxFunding: 999999999999,
      };
    case 2:
      return {
        maxDurationDays: 60,
        maxFunding: 200000000,
      };
    case 1:
    default:
      return {
        maxDurationDays: 30,
        maxFunding: 50000000,
      };
  }
};

export const buildStep1Payload = (data, fromHelpRequestId) => ({
  ...data,
  description: sanitizeHtml(data?.description),
  beneficiaryInfo: {
    details: sanitizeHtml(data?.beneficiaryInfo?.details),
  },
  startDate: toIsoOrNull(data?.startDate),
  endDate: toIsoOrNull(data?.endDate),
  ...(fromHelpRequestId ? { fromHelpRequestId } : {}),
});

export const normalizeSkillsRequired = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const normalizeVolunteerRole = (role = {}) => ({
  title: role?.title || "",
  quantity: Number(role?.quantity || 0),
  skillsRequired: normalizeSkillsRequired(
    role?.skillsRequired ?? role?.skills,
  ),
  location: role?.location || "",
  duration: role?.duration || "",
});

export const normalizeVolunteerRoles = (roles = []) =>
  (Array.isArray(roles) ? roles : []).map(normalizeVolunteerRole);

export const buildStep2Payload = (data, isFunded) => {
  const normalizedVolunteerRoles = normalizeVolunteerRoles(data?.volunteerRoles);

  if (!isFunded) {
    return {
      ...data,
      targetAmount: 0,
      mvpAmount: 0,
      budgetBreakdown: [],
      milestones: (data?.milestones || []).map((milestone) => ({
        ...milestone,
        targetAmount: 0,
      })),
      volunteerRoles: data?.needsVolunteers ? normalizedVolunteerRoles : [],
    };
  }

  return {
    ...data,
    volunteerRoles: data?.needsVolunteers ? normalizedVolunteerRoles : [],
  };
};

export const mergeDraftFormData = (formData = {}, payload = {}) => ({
  ...formData,
  ...payload,
});

export const calculatePercentage = (current, total) => {
  if (!total || Number(total) <= 0) return 0;
  const numCurrent = Number(current) || 0;
  const percent = (numCurrent / Number(total)) * 100;
  return Math.min(Math.max(percent, 0), 100);
};

export const calculateUnallocatedAmount = (targetAmount, milestones = []) => {
  const totalTarget = Number(targetAmount) || 0;

  const allocatedAmount = (Array.isArray(milestones) ? milestones : []).reduce(
    (sum, milestone) => sum + (Number(milestone?.targetAmount) || 0),
    0,
  );

  return totalTarget - allocatedAmount;
};

export const getMilestoneAllocationSummary = (
  targetAmount,
  milestones = [],
) => {
  const numericTarget = Number(targetAmount) || 0;
  const unallocatedAmount = calculateUnallocatedAmount(
    numericTarget,
    milestones,
  );
  const allocatedAmount = numericTarget - unallocatedAmount;
  const allocationPercent =
    numericTarget > 0
      ? Math.min((allocatedAmount / numericTarget) * 100, 100)
      : 0;

  return {
    unallocatedAmount,
    allocatedAmount,
    allocationPercent,
    isPerfectlyAllocated: unallocatedAmount === 0 && numericTarget > 0,
    isOverAllocated: unallocatedAmount < 0,
  };
};

export const getMediaValue = (item) => item?.file || item?.data || item;

export const getMediaName = (item) => {
  const media = getMediaValue(item);
  if (!media) return "file";
  if (media instanceof File) return media.name || "file";
  return media?.originalName || media?.name || media?.publicId || "file";
};

export const getMediaType = (item) => {
  const media = getMediaValue(item);
  if (!media) return "unknown";
  if (media instanceof File) return media.type || "unknown";

  return (
    media?.mimeType ||
    media?.type ||
    media?.mediaType ||
    media?.mimetype ||
    "unknown"
  );
};

export const getObjectUrl = (media) => {
  if (!media) return null;
  if (typeof media === "string") return media;
  if (typeof media?.url === "string") return media.url;
  if (media instanceof File || media instanceof Blob) {
    return URL.createObjectURL(media);
  }
  return null;
};

export const buildCoverSource = (coverMedia) => {
  if (!Array.isArray(coverMedia) || coverMedia.length === 0) return null;
  const media = getMediaValue(coverMedia[0]);
  return getObjectUrl(media);
};

export const buildDocumentViewModels = (documents = []) =>
  (Array.isArray(documents) ? documents : []).map((doc) => {
    const media = getMediaValue(doc);
    const url = getObjectUrl(media);
    const name = getMediaName(doc);
    const type = String(getMediaType(doc)).toLowerCase();
    const isImage = type.includes("image");
    const isPdf = type.includes("pdf") || name.toLowerCase().endsWith(".pdf");

    return {
      key: `${name}-${url || "no-url"}`,
      url,
      name,
      type,
      isImage,
      isPdf,
    };
  });

export const getPreviewChecklist = (formData = {}) => {
  const totalEvidenceCount =
    (Array.isArray(formData.coverMedia) ? formData.coverMedia.length : 0) +
    (Array.isArray(formData.documents) ? formData.documents.length : 0);

  return {
    isStoryComplete:
      Boolean(formData.title) &&
      Boolean(formData.category) &&
      Boolean(formData.location),
    isEvidenceUploaded: totalEvidenceCount >= 3,
    isBudgetSet:
      formData.projectType === "FUNDED"
        ? Number(formData.targetAmount) > 0 &&
          (formData.milestones?.length || 0) > 0
        : true,
    isVolunteersAdded: formData.needsVolunteers
      ? (formData.volunteerRoles?.length || 0) > 0
      : true,
    totalEvidenceCount,
    totalVolunteers:
      formData.volunteerRoles?.reduce(
        (sum, role) => sum + (Number(role?.quantity) || 0),
        0,
      ) || 0,
    milestonesCount: formData.milestones?.length || 0,
  };
};