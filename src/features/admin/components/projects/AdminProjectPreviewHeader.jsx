import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { PROJECT_INTENTS } from "@/shared/constants/project";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

export default function AdminProjectPreviewHeader({
  project,
  isReviewable,
  canRequestRevision,
  revisionCount,
  isProcessing,
  onBack,
  onApprove,
  onOpenModal,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/30 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
            <ShieldCheck size={11} />
            Bảng kiểm duyệt của Quản trị viên
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Kiểm duyệt hồ sơ dự án
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ProjectStatusBadge status={project.status} />

        {isReviewable ? (
          <>
            <button
              type="button"
              onClick={onApprove}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <CheckCircle2 size={16} />
              Phê duyệt
            </button>

            {canRequestRevision ? (
              <button
                type="button"
                onClick={() => onOpenModal(PROJECT_INTENTS.REVISION)}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <AlertTriangle size={16} />
                Yêu cầu sửa
              </button>
            ) : (
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600">
                Đã hết lượt sửa (Lần 3)
              </div>
            )}

            <button
              type="button"
              onClick={() => onOpenModal(PROJECT_INTENTS.REJECT)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <XCircle size={16} />
              Từ chối
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}