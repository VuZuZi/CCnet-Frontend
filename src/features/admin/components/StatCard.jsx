import {
  AlertTriangle,
  Ban,
  CreditCard,
  RefreshCw,
  Rocket,
  ShieldAlert,
  Users,
} from "lucide-react";

const iconMap = {
  group: Users,
  block: Ban,
  rocket: Rocket,
  flag: ShieldAlert,
  wallet: CreditCard,
  refresh: RefreshCw,
};

const toneMap = {
  group: {
    iconWrap: "bg-amber-100 text-[#FBBF24]",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  block: {
    iconWrap: "bg-rose-100 text-rose-600",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
  rocket: {
    iconWrap: "bg-sky-100 text-sky-600",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
  flag: {
    iconWrap: "bg-orange-100 text-orange-600",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
  },
  wallet: {
    iconWrap: "bg-emerald-100 text-emerald-600",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  refresh: {
    iconWrap: "bg-violet-100 text-violet-600",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
  default: {
    iconWrap: "bg-slate-100 text-slate-600",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

function normalizeValue(value) {
  if (value === null || value === undefined) return "0";
  return String(value);
}

export default function StatCard({ title, value, icon = "default" }) {
  const Icon = iconMap[icon] || AlertTriangle;
  const tone = toneMap[icon] || toneMap.default;

  return (
    <div className="group overflow-hidden rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(251,191,36,0.16)] md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] ${tone.badge}`}
          >
            Thống kê
          </div>

          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500 md:text-[15px]">
            {title}
          </p>

          <p className="mt-3 break-words text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {normalizeValue(value)}
          </p>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] shadow-sm transition duration-300 group-hover:scale-[1.04] ${tone.iconWrap}`}
        >
          <Icon size={26} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-5 h-px w-full bg-gradient-to-r from-amber-100 via-slate-100 to-transparent" />

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
          Cập nhật theo thời gian thực
        </span>

        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
      </div>
    </div>
  );
}