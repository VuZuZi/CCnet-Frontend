import { ArrowRight, FolderKanban } from 'lucide-react';

export function ImpactMetrics({ supportedCount = 0, isOwnProfile = false, onOpenSupportedProjects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-purpose="metrics-grid">
      <div className="bg-[#fef3c7] p-6 rounded-2xl flex flex-col justify-center">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Độ Tin Cậy Cao</span>
        <span className="text-3xl font-extrabold text-amber-900">850 điểm</span>
      </div>
      <button
        type="button"
        onClick={isOwnProfile ? onOpenSupportedProjects : undefined}
        className={`group bg-[#dcfce7] p-6 rounded-2xl flex flex-col justify-center text-left transition-transform duration-200 ${
          isOwnProfile ? 'hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100 cursor-pointer' : 'cursor-default'
        }`}
      >
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1 flex items-center gap-2">
          <FolderKanban size={14} />
          Tổng Hỗ Trợ
        </span>
        <span className="text-3xl font-extrabold text-emerald-900 flex items-end gap-2">
          {supportedCount}
          <span className="pb-1 text-sm font-semibold text-emerald-700">dự án</span>
        </span>
        {isOwnProfile ? (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">
            Xem các dự án đã hỗ trợ
            <ArrowRight size={12} />
          </span>
        ) : null}
      </button>
      <div className="bg-[#e0f2fe] p-6 rounded-2xl flex flex-col justify-center">
        <span className="text-xs font-bold text-sky-800 uppercase tracking-widest mb-1">Thời Gian Đóng Góp</span>
        <span className="text-3xl font-extrabold text-sky-900">45h</span>
      </div>
    </div>
  );
}