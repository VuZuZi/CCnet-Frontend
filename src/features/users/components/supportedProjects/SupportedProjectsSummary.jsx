import {
  CheckCircle2,
  CircleCheckBig,
  Clock3,
  TrendingUp,
  XCircle,
} from "lucide-react";

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  highlighted = false,
}) {
  const toneClasses = {
    default: "border-slate-200 bg-white text-slate-900",
    amber:
      "border-amber-200 bg-[linear-gradient(180deg,#FFF8E6_0%,#FFFBF2_100%)] text-slate-900",
    emerald:
      "border-emerald-200 bg-[linear-gradient(180deg,#F3FFF8_0%,#FFFFFF_100%)] text-slate-900",
    rose:
      "border-rose-200 bg-[linear-gradient(180deg,#FFF6F7_0%,#FFFFFF_100%)] text-slate-900",
    violet:
      "border-violet-200 bg-[linear-gradient(180deg,#F8F5FF_0%,#FFFFFF_100%)] text-slate-900",
    sky: "border-sky-200 bg-[linear-gradient(180deg,#F3FAFF_0%,#FFFFFF_100%)] text-slate-900",
  };

  return (
    <div
      className={`group rounded-[28px] border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] ${
        toneClasses[tone]
      } ${highlighted ? "ring-1 ring-amber-200/70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black leading-none text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>

        <div
          className={`rounded-2xl p-3 transition ${
            highlighted
              ? "bg-amber-100 text-amber-700"
              : "bg-white text-slate-500 shadow-sm"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function SupportedProjectsSummary({ summary }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="Đã tham gia"
        value={summary.joined}
        hint="Đơn đã được duyệt"
        icon={CheckCircle2}
        tone="amber"
        highlighted
      />

      <SummaryCard
        label="Đang hoạt động"
        value={summary.inProgress}
        hint="Dự án đang triển khai"
        icon={TrendingUp}
        tone="sky"
      />

      <SummaryCard
        label="Chờ duyệt"
        value={summary.pending}
        hint="Đang chờ người tổ chức phản hồi"
        icon={Clock3}
        tone="default"
      />

      <SummaryCard
        label="Hoàn thành"
        value={summary.completed}
        hint="Dự án đã kết thúc"
        icon={CircleCheckBig}
        tone="violet"
      />

      <SummaryCard
        label="Bị từ chối"
        value={summary.rejected}
        hint="Đơn chưa được chấp nhận"
        icon={XCircle}
        tone="rose"
      />
    </section>
  );
}

export default SupportedProjectsSummary;