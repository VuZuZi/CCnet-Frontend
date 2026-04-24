import { calculateUnallocatedAmount } from "../../../../utils/finance.utils";

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
    items.push("Thiếu địa điểm cụ thể trên bản đồ");
  }

  if (!formData?.description?.trim() || formData.description === "<p></p>") {
    items.push("Câu chuyện dự án chưa được nhập hoặc quá ngắn");
  }

  if (!formData?.beneficiaryInfo?.details?.trim()) {
    items.push("Thiếu mô tả chi tiết đối tượng thụ hưởng");
  }

  if (!formData?.startDate) {
    items.push("Thiếu ngày bắt đầu dự kiến");
  }

  if (!formData?.endDate) {
    items.push("Thiếu ngày kết thúc dự kiến");
  }

  const coverCount = getPreviewCoverMedia(formData) ? 1 : 0;
  const docCount = getPreviewDocuments(formData).length;
  if (coverCount + docCount < 3) {
    items.push("Bắt buộc có tối thiểu 3 tệp minh chứng (Ảnh bìa + Tài liệu)");
  }

  if (formData?.projectType === "FUNDED") {
    const targetAmount = Number(formData?.targetAmount || 0);
    const milestones = normalizePreviewArray(formData?.milestones);

    if (targetAmount <= 0) {
      items.push("Mục tiêu gây quỹ phải lớn hơn 0");
    }

    if (milestones.length === 0) {
      items.push("Dự án gây quỹ bắt buộc phải có ít nhất 1 mốc hoạt động");
    } else {
      const unallocated = calculateUnallocatedAmount(targetAmount, milestones);
      if (unallocated !== 0) {
        const diffText = unallocated > 0 ? "thiếu" : "vượt";
        items.push(
          `Ngân sách các mốc chưa khớp (Đang ${diffText} ${Math.abs(unallocated).toLocaleString()} đ)`
        );
      }

      milestones.forEach((m, idx) => {
        const prefix = `Mốc ${idx + 1} ("${m.title || "Chưa đặt tên"}")`;
        if (!m.title?.trim()) items.push(`${prefix}: Thiếu tiêu đề`);
        if (!m.startDate || !m.endDate) items.push(`${prefix}: Thiếu thời gian thực hiện`);
        if (!m.deliverables?.trim()) items.push(`${prefix}: Thiếu kết quả bàn giao (Deliverables)`);
      });
    }
  }

  if (formData?.needsVolunteers) {
    const roles = normalizePreviewArray(formData?.volunteerRoles);
    if (roles.length === 0) {
      items.push("Đã bật cần tình nguyện viên nhưng chưa thêm vị trí nào");
    }
  }

  return items;
};

export const isPreviewReadyToSubmit = (formData) =>
  getPreviewValidationItems(formData).length === 0;

export const getPreviewProjectTypeLabel = (projectType) =>
  projectType === "VOLUNTEER_ONLY" ? "Chỉ tuyển tình nguyện viên" : "Dự án gây quỹ";

export const getPreviewCategoryLabel = (category) => {
  const categoryMap = {
    Y_TE: "Y tế",
    GIAO_DUC: "Giáo dục",
    THIEN_TAI: "Cứu trợ thiên tai",
    XAY_DUNG: "Xây dựng hạ tầng",
    MOI_TRUONG: "Bảo vệ môi trường",
    KHAC: "Khác",
  };

  return categoryMap[category] || "Chưa chọn";
};