import { Calendar, Clock } from "lucide-react";
import { formatDate } from "../../utils/adminProjectDisplay.utils";

export default function AdminProjectCardTimeline({
  tone,
  project,
  daysRemaining,
  isExpired,
  showExpiredBadge,
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border px-3 py-3 md:flex-row md:items-center md:justify-between ${tone.timeline}`}
    >
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
        <div className="inline-flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-400" />
          <span>Bắt đầu: {formatDate(project?.startDate)}</span>
        </div>

        <div className="inline-flex items-center gap-1.5">
          <Clock size={12} className="text-slate-400" />
          <span>Kết thúc: {formatDate(project?.endDate)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {daysRemaining !== null && !isExpired && daysRemaining > 0 ? (
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Còn lại {daysRemaining} ngày
          </div>
        ) : null}

        {showExpiredBadge ? (
          <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            Dự án đã hết hạn
          </div>
        ) : null}
      </div>
    </div>
  );
}