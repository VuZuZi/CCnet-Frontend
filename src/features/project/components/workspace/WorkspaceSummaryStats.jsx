import { formatProjectCurrency } from "@/features/project/utils/projectDisplay.utils";

export function WorkspaceSummaryStats({ summary }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Tổng dự án
        </p>
        <p className="mt-1 text-3xl font-black text-slate-900">{summary.total}</p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
          Đang hoạt động
        </p>
        <p className="mt-1 text-3xl font-black text-emerald-800">{summary.active}</p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">
          Chờ duyệt
        </p>
        <p className="mt-1 text-3xl font-black text-amber-800">{summary.pending}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Bản nháp
        </p>
        <p className="mt-1 text-3xl font-black text-slate-900">{summary.draft}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Đã gây quỹ
        </p>
        <p className="mt-1 text-lg font-black text-slate-900">
          {formatProjectCurrency(summary.raised)}đ
        </p>
        <p className="text-xs text-slate-500">
          /{formatProjectCurrency(summary.target)}đ
        </p>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">
          Tình nguyện viên
        </p>
        <p className="mt-1 text-lg font-black text-sky-900">
          {summary.volunteerCurrent}/{summary.volunteerTarget}
        </p>
        <p className="text-xs text-sky-700">đang tham gia / cần tuyển</p>
      </div>
    </section>
  );
}

export default WorkspaceSummaryStats;