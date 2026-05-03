import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, Settings2 } from "lucide-react";
import { buildProjectStatusOptions } from "../../utils/projectAction.utils";
import {
  isReviewableProjectStatus,
  normalizeProjectStatus,
} from "../../utils/projectStatus.utils";

export default function AdminProjectCardFooterActions({
  project,
  onOpenDetail,
  onOpenReview,
  onRequestProjectAction,
}) {
  const reviewStage = isReviewableProjectStatus(project?.status);
  const lifecycleOptions = useMemo(() => {
    const currentStatus = normalizeProjectStatus(project?.status);
    return buildProjectStatusOptions(project).filter(
      (option) => normalizeProjectStatus(option.value) !== currentStatus
    );
  }, [project]);

  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    setSelectedStatus(lifecycleOptions[0]?.value || "");
  }, [lifecycleOptions, project?._id, project?.status]);

  if (reviewStage) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpenReview(project)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-400 px-4 text-sm font-bold text-slate-950 shadow-sm transition hover:border-amber-600 hover:bg-amber-500"
        >
          <ArrowRight size={15} />
          Mở cockpit kiểm duyệt
        </button>

        <button
          type="button"
          onClick={() => onOpenDetail(project)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
        >
          <Eye size={15} />
          Xem chi tiết
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {lifecycleOptions.length ? (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="h-10 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
          >
            {lifecycleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRequestProjectAction?.(project, selectedStatus)}
            disabled={!selectedStatus}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 text-sm font-bold text-amber-800 shadow-sm transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Settings2 size={15} />
            Thực hiện
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onOpenDetail(project)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
      >
        <Eye size={15} />
        Xem chi tiết
      </button>
    </div>
  );
}
