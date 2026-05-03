import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AI_STATUS_LABELS } from "./projectReview.constants";

const PROJECT_STATUS_LABELS = {
  PENDING_APPROVAL: "Chờ quản trị viên kiểm duyệt",
  REVISION_REQUESTED: "Đã yêu cầu chỉnh sửa",
  APPROVED: "Đã phê duyệt",
  REJECTED: "Đã từ chối",
  DRAFT: "Bản nháp",
};

const RISK_LEVEL_LABELS = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  critical: "Nghiêm trọng",
};

export default function AdminProjectReviewHeader({
  project,
  review,
  aiRun,
  isFetching,
  onRefresh,
}) {
  const navigate = useNavigate();
  const rawStatus = project?.status;
  const statusLabel = PROJECT_STATUS_LABELS[rawStatus] || rawStatus || "Chưa có dữ liệu";
  const aiStatus = aiRun?.status || "NONE";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/admin/projects")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Cockpit kiểm duyệt dự án
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {project?.title || "Dự án chưa có tên"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Admin là người ra quyết định cuối cùng. AI chỉ là nguồn gợi ý hỗ trợ xem xét.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
              {statusLabel}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
              Phiên bản: {review?.submissionVersion || 1}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
              Lần yêu cầu sửa: {Number(project?.revisionCount || 0)}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
              AI: {AI_STATUS_LABELS[aiStatus] || "Chưa có dữ liệu"}
            </span>
            {aiRun?.overallRiskLevel ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                Rủi ro: {RISK_LEVEL_LABELS[aiRun.overallRiskLevel] || aiRun.overallRiskLevel}
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-amber-300 hover:bg-amber-50"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>
    </div>
  );
}