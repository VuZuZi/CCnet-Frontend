export const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "violence", label: "Violence" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "other", label: "Other" },
];

export const normalizeSidebarProjectId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return String(value._id || value.id || value.userId || "");
  }
  return "";
};

export const formatSidebarCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

export const getSidebarProjectStats = (project) => {
  const isVolunteerOnly = project?.projectType === "VOLUNTEER_ONLY";
  const isFunded = project?.projectType === "FUNDED" || !project?.projectType;
  const isFundingPhase = String(project?.status || "").toUpperCase() === "FUNDING";

  const availableBalance = Number(
    project?.financialDetail?.availableBalance ?? project?.currentAmount ?? 0,
  );

  const targetAmount = Number(project?.targetAmount ?? 0);
  const pendingRefunds = Number(project?.financialDetail?.pendingRefunds ?? 0);

  const progressPercent =
    targetAmount > 0
      ? Math.min(Math.round((availableBalance / targetAmount) * 100), 100)
      : 0;

  const currentVolunteers = Number(project?.stats?.currentVolunteers ?? 0);
  const targetVolunteers =
    Number(project?.stats?.targetVolunteers ?? 0) ||
    (Array.isArray(project?.volunteerRoles)
      ? project.volunteerRoles.reduce(
          (sum, role) => sum + Number(role?.quantity || 0),
          0,
        )
      : 0);

  const volunteerPercent =
    targetVolunteers > 0
      ? Math.min(Math.round((currentVolunteers / targetVolunteers) * 100), 100)
      : 0;

  return {
    isVolunteerOnly,
    isFunded,
    isFundingPhase,
    availableBalance,
    targetAmount,
    pendingRefunds,
    progressPercent,
    currentVolunteers,
    targetVolunteers,
    volunteerPercent,
  };
};