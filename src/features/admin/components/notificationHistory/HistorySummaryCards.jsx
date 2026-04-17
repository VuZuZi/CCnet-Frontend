import { BellRing, ShieldCheck, Users } from "lucide-react";

function SummaryCard({ icon: Icon, label, value, tone = "amber" }) {
  const toneMap = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.22)] ${
        toneMap[tone] || toneMap.amber
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
          {label}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 text-[34px] font-black leading-none tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function HistorySummaryCards({ stats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
      <SummaryCard
        icon={BellRing}
        label="Nhật ký đã gửi"
        value={stats?.total ?? 0}
        tone="amber"
      />
      <SummaryCard
        icon={Users}
        label="Tất cả người dùng"
        value={stats?.allUsers ?? 0}
        tone="slate"
      />
      <SummaryCard
        icon={ShieldCheck}
        label="Tùy chỉnh"
        value={stats?.custom ?? 0}
        tone="emerald"
      />
    </div>
  );
}