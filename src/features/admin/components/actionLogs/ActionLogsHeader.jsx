import { ArrowLeft } from "lucide-react";

function StatCard({ label, value, className = "" }) {
  return (
    <div
      className={`rounded-[22px] border px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-2 text-[30px] font-black leading-none">{value}</p>
    </div>
  );
}

function ActionLogsHeader({ stats, onBack }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
          >
            <ArrowLeft size={16} strokeWidth={2.4} />
            Back to User Management
          </button>

          <h1 className="text-[34px] font-black leading-none tracking-tight text-slate-900">
            User Action Logs
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[460px]">
          <StatCard
            label="Total"
            value={stats.total}
            className="border-slate-200 bg-slate-50 text-slate-700"
          />
          <StatCard
            label="Ban"
            value={stats.ban}
            className="border-red-200 bg-red-50 text-red-700"
          />
          <StatCard
            label="Unban"
            value={stats.unban}
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Status"
            value={stats.status}
            className="border-amber-200 bg-amber-50 text-amber-700"
          />
        </div>
      </div>
    </div>
  );
}

export default ActionLogsHeader;