import { ArrowRight, FolderKanban, ShieldCheck, Star } from "lucide-react";

export function ImpactMetrics({
  supportedCount = 0,
  completedCount = 0,
  averageRating = 0,
  trustScore = 0,
  isOwnProfile = false,
  onOpenSupportedProjects,
}) {
  const safeAverageRating = Number.isFinite(Number(averageRating))
    ? Number(averageRating)
    : 0;

  const displayAverageRating =
    safeAverageRating > 0 ? safeAverageRating.toFixed(1) : "Chưa có";

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
      data-purpose="metrics-grid"
    >
      <div className="flex flex-col justify-center rounded-2xl bg-[#fef3c7] p-6">
        <span className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
          <ShieldCheck size={14} />
          Độ tin cậy
        </span>
        <span className="text-3xl font-extrabold text-amber-900">
          {trustScore} điểm
        </span>
        <span className="mt-2 text-sm text-amber-700">
          Tính từ các dự án volunteer đã hoàn thành
        </span>
      </div>

      <button
        type="button"
        onClick={isOwnProfile ? onOpenSupportedProjects : undefined}
        className={`group flex flex-col justify-center rounded-2xl bg-[#dcfce7] p-6 text-left transition-transform duration-200 ${
          isOwnProfile
            ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100"
            : "cursor-default"
        }`}
      >
        <span className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
          <FolderKanban size={14} />
          Tổng hỗ trợ
        </span>
        <span className="flex items-end gap-2 text-3xl font-extrabold text-emerald-900">
          {supportedCount}
          <span className="pb-1 text-sm font-semibold text-emerald-700">
            dự án
          </span>
        </span>

        {isOwnProfile ? (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">
            Xem các dự án đã hỗ trợ
            <ArrowRight size={12} />
          </span>
        ) : null}
      </button>

      <div className="flex flex-col justify-center rounded-2xl bg-[#e0f2fe] p-6">
        <span className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-800">
          <Star size={14} />
          Đánh giá trung bình
        </span>
        <span className="flex items-end gap-2 text-3xl font-extrabold text-sky-900">
          {displayAverageRating}
          {safeAverageRating > 0 ? (
            <span className="pb-1 text-sm font-semibold text-sky-700">/ 5</span>
          ) : null}
        </span>
        <span className="mt-2 text-sm text-sky-700">
          {completedCount} dự án đã hoàn thành
        </span>
      </div>
    </div>
  );
}

export default ImpactMetrics;