export const normalizePreviewArray = (value) =>
  Array.isArray(value) ? value : [];

export const getPreviewCoverMedia = (formData) => {
  const coverMedia = normalizePreviewArray(formData?.coverMedia);
  return coverMedia[0] || null;
};

export const getPreviewDocuments = (formData) =>
  normalizePreviewArray(formData?.documents);

export const getPreviewValidationItems = (formData) => {
  const items = [];

  if (!formData?.title?.trim()) {
    items.push("Thiếu tên dự án");
  }

  if (!formData?.category) {
    items.push("Thiếu danh mục");
  }

  if (!formData?.location?.address) {
    items.push("Thiếu địa điểm");
  }

  if (!formData?.description?.trim()) {
    items.push("Thiếu câu chuyện dự án");
  }

  if (!formData?.beneficiaryInfo?.details?.trim()) {
    items.push("Thiếu mô tả đối tượng thụ hưởng");
  }

  if (!formData?.startDate) {
    items.push("Thiếu ngày bắt đầu");
  }

  if (!formData?.endDate) {
    items.push("Thiếu ngày kết thúc");
  }

  if (!getPreviewCoverMedia(formData)) {
    items.push("Thiếu ảnh hoặc video đại diện");
  }

  if (formData?.projectType === "FUNDED") {
    if (!Number(formData?.targetAmount || 0)) {
      items.push("Thiếu mục tiêu gây quỹ");
    }

    if (!normalizePreviewArray(formData?.milestones).length) {
      items.push("Thiếu milestones ngân sách");
    }
  }

  if (
    formData?.needsVolunteers &&
    !normalizePreviewArray(formData?.volunteerRoles).length
  ) {
    items.push("Đã bật tuyển TNV nhưng chưa có vị trí tuyển");
  }

  return items;
};

export const isPreviewReadyToSubmit = (formData) =>
  getPreviewValidationItems(formData).length === 0;

export const getPreviewProjectTypeLabel = (projectType) =>
  projectType === "VOLUNTEER_ONLY" ? "Volunteer Only" : "Funded";

export const getPreviewCategoryLabel = (category) => {
  const categoryMap = {
    Y_TE: "Healthcare",
    GIAO_DUC: "Education",
    THIEN_TAI: "Disaster Relief",
    XAY_DUNG: "Infrastructure",
    MOI_TRUONG: "Environmental Protection",
    KHAC: "Other",
  };

  return categoryMap[category] || "Not selected";
};