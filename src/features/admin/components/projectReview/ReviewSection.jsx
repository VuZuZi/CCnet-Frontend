import { AlertTriangle, Info } from "lucide-react";

export default function ReviewSection({ id, title, children, findings = [], severity }) {
  const isCritical = severity === "critical";
  const isWarning = severity === "needs_review" || severity === "warning";

  const containerClasses = isCritical
    ? "border-red-300 bg-red-50/40"
    : isWarning
    ? "border-amber-300 bg-amber-50/40"
    : "border-slate-200 bg-white";

  return (
    <section
      id={id}
      tabIndex={-1}
      className={`scroll-mt-24 rounded-2xl border p-5 shadow-sm outline-none focus:ring-4 focus:ring-amber-100 transition-colors ${containerClasses}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <div className="flex items-center gap-2">
          {isCritical ? (
            <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
              <AlertTriangle size={14} /> AI cảnh báo nghiêm trọng
            </span>
          ) : isWarning ? (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              <AlertTriangle size={14} /> AI cần xem xét
            </span>
          ) : null}
          {findings.length > 0 && !isCritical && !isWarning && (
            <span className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Info size={14} /> AI gợi ý
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-4">{children}</div>

      {findings.length ? (
        <div className="mt-5 space-y-3 border-t border-slate-200/60 pt-4">
          <p className="text-xs font-bold uppercase text-slate-500">
            Chi tiết rủi ro từ AI (Không thay thế quyết định của quản trị viên)
          </p>
          {findings.map((finding) => {
            const isFCritical = finding.severity === "critical";
            const isFWarning = finding.severity === "needs_review" || finding.severity === "warning";
            
            return (
              <div
                key={finding.id || finding.title}
                className={`rounded-xl border p-3 text-sm ${
                  isFCritical
                    ? "border-red-200 bg-red-50 text-red-900"
                    : isFWarning
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-blue-200 bg-blue-50 text-blue-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold">{finding.title}</p>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    isFCritical ? "bg-red-200 text-red-800" : isFWarning ? "bg-amber-200 text-amber-800" : "bg-blue-200 text-blue-800"
                  }`}>
                    {finding.severity}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 leading-6 opacity-90" title={finding.detail}>
                  {finding.detail}
                </p>
                {finding.suggestedAdminQuestion && (
                  <div className="mt-2 rounded-lg bg-white/60 p-2 text-xs italic">
                    <span className="font-semibold not-italic">Câu hỏi gợi ý: </span>
                    {finding.suggestedAdminQuestion}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
