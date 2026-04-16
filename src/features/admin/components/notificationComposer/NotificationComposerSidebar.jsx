import { SendHorizontal } from "lucide-react";
import { SEVERITY_OPTIONS } from "../../utils/adminNotificationComposer.constants";

function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
      {children}
    </label>
  );
}

function SummaryPill({ children, tone = "slate" }) {
  const toneMap = {
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      {children}
    </span>
  );
}

export default function NotificationComposerSidebar({
  form,
  summaryText,
  isSubmitting,
  onChange,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="space-y-5">
          <div>
            <FieldLabel>Recipient mode</FieldLabel>

            <div className="relative mt-2">
              <select
                name="recipientMode"
                value={form.recipientMode}
                onChange={onChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                <option value="all">All users</option>
                <option value="custom">Custom recipients</option>
              </select>

              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div>
            <FieldLabel>Severity</FieldLabel>

            <div className="relative mt-2">
              <select
                name="severity"
                value={form.severity}
                onChange={onChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SummaryPill tone="amber">
              Recipient mode: {form.recipientMode === "all" ? "All users" : "Custom"}
            </SummaryPill>

            <SummaryPill tone="emerald">
              Severity:{" "}
              {SEVERITY_OPTIONS.find((item) => item.value === form.severity)?.label}
            </SummaryPill>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
            {summaryText}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <SendHorizontal size={16} />
          {isSubmitting ? "Sending..." : "Send notification"}
        </button>
      </div>
    </div>
  );
}