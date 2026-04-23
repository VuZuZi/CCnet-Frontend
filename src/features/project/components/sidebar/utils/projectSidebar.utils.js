export const REPORT_REASONS = [
  { value: "spam", label: "Thư rác" },
  { value: "harassment", label: "Quấy rối" },
  { value: "inappropriate", label: "Nội dung không phù hợp" },
  { value: "violence", label: "Bạo lực" },
  { value: "hate_speech", label: "Ngôn từ thù ghét" },
  { value: "other", label: "Khác" },
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

  const availableBalance = Number(project?.financialDetail?.availableBalance ?? 0);
  const pendingDisbursement = Number(project?.financialDetail?.pendingDisbursement ?? 0);
  const escrowBalance = Number(
    project?.financialDetail?.escrowBalance ?? availableBalance + pendingDisbursement,
  );
  const raisedAmount = Number(
    project?.financialOverview?.totalRaised ??
      project?.financialDetail?.totalRaised ??
      project?.currentAmount ??
      0,
  );

  const targetAmount = Number(project?.targetAmount ?? 0);
  const pendingRefunds = Number(project?.financialDetail?.pendingRefunds ?? 0);

  const progressPercent =
    targetAmount > 0
      ? Math.min(Math.round((raisedAmount / targetAmount) * 100), 100)
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
    availableBalance: raisedAmount,
    raisedAmount,
    escrowBalance,
    pendingDisbursement,
    targetAmount,
    pendingRefunds,
    progressPercent,
    currentVolunteers,
    targetVolunteers,
    volunteerPercent,
  };
};
