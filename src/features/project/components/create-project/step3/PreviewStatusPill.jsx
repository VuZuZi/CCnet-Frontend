export function PreviewStatusPill({ children, tone = "default" }) {
  const toneClassMap = {
    default: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${toneClassMap[tone] || toneClassMap.default}`}
    >
      {children}
    </span>
  );
}

export default PreviewStatusPill;