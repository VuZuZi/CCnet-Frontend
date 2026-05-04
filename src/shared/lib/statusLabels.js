const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Không hoạt động",
  BANNED: "Đã khóa",
  DRAFT: "Bản nháp",
  PENDING: "Đang chờ",
  PENDING_APPROVAL: "Chờ kiểm duyệt",
  UNDER_REVIEW: "Đang kiểm duyệt",
  REVISION_REQUESTED: "Yêu cầu chỉnh sửa",
  REJECTED: "Đã từ chối",
  APPROVED: "Đã duyệt",
  FUNDING: "Đang gây quỹ",
  RECRUITING: "Đang tuyển tình nguyện viên",
  EXECUTING: "Đang thực hiện",
  UPDATING: "Đang cập nhật",
  PAUSED: "Tạm dừng",
  COMPLETED: "Đã hoàn thành",
  COMPLETED_SUCCESSFULLY: "Hoàn thành thành công",
  COMPLETED_PARTIAL: "Hoàn thành một phần",
  CANCELLED: "Đã hủy",
  CANCELLATION_PENDING: "Chờ hủy",
  CANCELLED_FRAUD: "Đã hủy do gian lận",
  CANCELLED_BY_PLATFORM: "Nền tảng đã hủy",
  CANCELLED_BY_ORGANIZER: "Tổ chức đã hủy",
  FAILED: "Thất bại",
  FAILED_FUNDING: "Gây quỹ thất bại",
  FAILED_EXECUTION: "Thực hiện thất bại",
  PROCESSING: "Đang xử lý",
  SUCCESS: "Thành công",
  RESOLVED: "Đã xử lý",
  REFUNDED: "Đã hoàn tiền",
};

export function getStatusLabel(status, fallback = "--") {
  const normalized = String(status || "").trim().toUpperCase();

  if (!normalized) return fallback;

  return STATUS_LABELS[normalized] || status || fallback;
}
