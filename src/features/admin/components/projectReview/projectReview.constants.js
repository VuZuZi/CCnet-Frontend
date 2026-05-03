export const CHECKLIST_LABELS = {
  beneficiary_clear: "Người thụ hưởng rõ ràng",
  budget_clear: "Ngân sách / cách sử dụng tiền rõ ràng",
  funded_milestones_cost_clarity: "Milestone có đơn giá, số lượng, chi phí",
  goods_have_delivery_followup: "Mua hàng hóa có bước bàn giao / phân phối",
  evidence_plan_sufficient: "Kế hoạch bằng chứng đủ để hậu kiểm",
  timeline_location_feasible: "Thời gian và địa điểm khả thi",
  organizer_trust_reviewed: "Đã xem bối cảnh tin cậy của organizer",
  documents_media_reviewed: "Đã xem tài liệu, hình ảnh, hồ sơ",
  ai_reviewed_or_bypassed: "Đã xem AI hoặc xác nhận kiểm duyệt thủ công",
  approval_consequences_acknowledged: "Đã hiểu hệ quả khi phê duyệt",
};

export const AI_STATUS_LABELS = {
  PENDING: "Đang chờ",
  RUNNING: "Đang phân tích",
  COMPLETED: "Đã hoàn tất",
  FAILED: "Không hoàn tất",
  STALE: "Không còn hiện hành",
  CANCELLED: "Đã hủy",
};

export const AI_STATUS_DESCRIPTIONS = {
  PENDING: "Đang chờ phân tích AI…",
  RUNNING: "AI đang phân tích hồ sơ…",
  COMPLETED: "Báo cáo phân tích sơ bộ đã sẵn sàng.",
  FAILED: "Báo cáo AI không hoàn tất. Admin vẫn có thể kiểm duyệt thủ công.",
  STALE: "Báo cáo AI không còn hiện hành do hồ sơ đã thay đổi.",
  CANCELLED: "Yêu cầu phân tích AI đã bị hủy.",
  NONE: "Chưa có báo cáo AI.",
};

export const SEVERITY_LABELS = {
  critical: "Nghiêm trọng",
  warning: "Cảnh báo",
  needs_review: "Cần xem xét",
  info: "Thông tin",
};

export const SEVERITY_CLASSES = {
  critical: "border-red-200 bg-red-50 text-red-800",
  warning: "border-orange-200 bg-orange-50 text-orange-800",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export const SEVERITY_BADGE_CLASSES = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-orange-100 text-orange-700 border-orange-200",
  needs_review: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-slate-100 text-slate-600 border-slate-200",
};

export const SECTION_LABELS = {
  project_summary: "Tóm tắt dự án",
  beneficiary: "Người thụ hưởng",
  budget: "Ngân sách",
  milestones: "Milestone",
  evidence: "Bằng chứng / tài liệu",
  timeline: "Thời gian / địa điểm",
  organizer: "Organizer",
  policy: "Chính sách / an toàn",
};

export const DECISION_LABELS = {
  APPROVED: "Phê duyệt",
  REVISION_REQUESTED: "Yêu cầu chỉnh sửa",
  REJECTED: "Từ chối",
};

export const MANUAL_AI_BYPASS_WARNING =
  "Báo cáo AI chưa sẵn sàng hoặc không hợp lệ. Bạn xác nhận đã kiểm duyệt thủ công trước khi phê duyệt.";
