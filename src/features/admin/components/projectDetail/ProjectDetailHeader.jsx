import { ArrowRight, History, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAdminUIStatusLabel,
  getAdminUIStatusStyle,
  isReviewableProjectStatus,
  mapProjectStatusToUI,
} from "../../utils/projectStatus.utils";
import { STATUS_ICON_MAP } from "../../utils/adminProjectDetailModal.utils";

export default function ProjectDetailHeader({
  project,
  onClose,
  onOpenHistory,
}) {
  const navigate = useNavigate();
  const uiStatus = mapProjectStatusToUI(project?.status);
  const currentStatusStyle = getAdminUIStatusStyle(uiStatus);
  const currentStatusLabel = getAdminUIStatusLabel(uiStatus);
  const StatusIcon = STATUS_ICON_MAP[uiStatus] || STATUS_ICON_MAP.DEFAULT;

  const canReview = isReviewableProjectStatus(project?.status);
  const canOpenHistory = Boolean(onOpenHistory);

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="min-w-0">
        <h3 className="truncate text-lg font-black tracking-tight text-slate-900 md:text-xl">
          {project?.title || "Dự án"}
        </h3>
        <p className="mt-1 text-xs text-slate-500 md:text-sm">
          {project?._id || "--"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold ${currentStatusStyle.bg} ${currentStatusStyle.border} ${currentStatusStyle.text}`}
        >
          <StatusIcon size={16} />
          {currentStatusLabel}
        </div>

        {canReview ? (
          <button
            type="button"
            onClick={() => navigate(`/admin/projects/${project._id}/review`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-amber-500"
          >
            <ArrowRight size={15} />
            Mở cockpit kiểm duyệt
          </button>
        ) : null}

        {canOpenHistory ? (
          <button
            type="button"
            onClick={() => onOpenHistory?.(project)}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 transition hover:bg-amber-100"
          >
            <History size={15} />
            Xem lịch sử
          </button>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
