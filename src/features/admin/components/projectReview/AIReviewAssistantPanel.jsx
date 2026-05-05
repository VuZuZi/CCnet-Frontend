import {
  Bot,
  CheckCircle2,
  Clock,
  Loader2,
  PlusCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  AI_STATUS_LABELS,
  AI_STATUS_DESCRIPTIONS,
  CHECKLIST_LABELS,
  SECTION_LABELS,
  SEVERITY_LABELS,
  SEVERITY_CLASSES,
  SEVERITY_BADGE_CLASSES,
} from "./projectReview.constants";

const SPINNER_STATES = ["PENDING", "RUNNING"];
const RETRY_BLOCKED_STATES = ["PENDING", "RUNNING"];

function AIStatusCard({ status }) {
  const description = AI_STATUS_DESCRIPTIONS[status] || AI_STATUS_DESCRIPTIONS.NONE;

  if (SPINNER_STATES.includes(status)) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <Loader2 size={20} className="shrink-0 animate-spin" />
        <div>
          <p className="font-bold">{AI_STATUS_LABELS[status] || status}</p>
          <p className="mt-0.5 leading-6">{description}</p>
        </div>
      </div>
    );
  }

  if (status === "COMPLETED") return null;

  if (status === "FAILED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <XCircle size={20} className="shrink-0" />
        <div>
          <p className="font-bold">Không hoàn tất</p>
          <p className="mt-0.5 leading-6">{description}</p>
        </div>
      </div>
    );
  }

  if (status === "STALE") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <Clock size={20} className="shrink-0" />
        <div>
          <p className="font-bold">Không còn hiện hành</p>
          <p className="mt-0.5 leading-6">{description}</p>
        </div>
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <XCircle size={20} className="shrink-0" />
        <div>
          <p className="font-bold">Đã hủy</p>
          <p className="mt-0.5 leading-6">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      <Bot size={20} className="shrink-0" />
      <div>
        <p className="font-bold">Chưa có báo cáo AI</p>
        <p className="mt-0.5 leading-6">{description}</p>
      </div>
    </div>
  );
}

function RiskSummaryCards({ run }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">Trạng thái</p>
        <p className="mt-1 text-base font-bold text-slate-900">
          {AI_STATUS_LABELS[run?.status] || "Chưa có dữ liệu"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">Mức rủi ro</p>
        <p className="mt-1 text-base font-bold text-slate-900">
          {run?.overallRiskLevel || "Chưa có dữ liệu"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">Điểm rủi ro</p>
        <p className="mt-1 text-base font-bold text-slate-900">
          {Number.isFinite(Number(run?.overallRiskScore))
            ? `${run.overallRiskScore}/100`
            : "Chưa có dữ liệu"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">Độ tin cậy</p>
        <p className="mt-1 text-base font-bold text-slate-900">
          {Number.isFinite(Number(run?.confidence))
            ? `${Math.round(Number(run.confidence) * 100)}%`
            : "Chưa có dữ liệu"}
        </p>
      </div>
    </div>
  );
}

const SEVERITY_ORDER = ["critical", "warning", "needs_review", "info"];

function FindingsList({ findings, onFindingClick, onInsertSuggestion }) {
  if (!findings.length) return null;

  const grouped = SEVERITY_ORDER.reduce((acc, severity) => {
    const items = findings.filter(
      (f) => (f.severity || "needs_review") === severity
    );

    if (items.length) acc.push({ severity, items });
    return acc;
  }, []);

  const knownSeverities = new Set(SEVERITY_ORDER);
  const unknown = findings.filter(
    (f) => !knownSeverities.has(f.severity || "needs_review")
  );

  if (unknown.length) {
    grouped.push({ severity: "needs_review", items: unknown });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900">
        Tín hiệu rủi ro và điểm cần quản trị viên xem xét thêm
      </h3>

      {grouped.map(({ severity, items }) => (
        <div key={severity} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                SEVERITY_BADGE_CLASSES[severity] ||
                SEVERITY_BADGE_CLASSES.needs_review
              }`}
            >
              {SEVERITY_LABELS[severity] || severity} ({items.length})
            </span>
          </div>

          {items.map((finding) => (
            <div
              key={finding.id || finding.title}
              className={`rounded-xl border p-3 text-sm transition ${
                SEVERITY_CLASSES[finding.severity] ||
                SEVERITY_CLASSES.needs_review
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onFindingClick?.(finding.section)}
                  className="font-bold hover:underline"
                >
                  {finding.title}
                </button>

                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold">
                  {SECTION_LABELS[finding.section] || finding.section}
                </span>
              </div>

              <p className="mt-1 leading-6">{finding.detail}</p>

              {finding.suggestedAdminQuestion && (
                <p className="mt-2 text-xs italic opacity-80">
                  Câu hỏi gợi ý: {finding.suggestedAdminQuestion}
                </p>
              )}

              {finding.suggestedRevisionText && onInsertSuggestion && (
                <button
                  type="button"
                  onClick={() => onInsertSuggestion(finding.suggestedRevisionText)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/50 px-2.5 py-1 text-xs font-bold hover:bg-white/80"
                >
                  <PlusCircle size={12} />
                  Chèn vào phản hồi
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SectionNavigationCards({ sectionSummary, onFindingClick }) {
  if (!sectionSummary.length) return null;

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">
          Điều hướng điểm cần kiểm tra
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          Click để nhảy tới section
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {sectionSummary.map((item) => {
          const description = [
            item.criticalCount ? `${item.criticalCount} nghiêm trọng` : "",
            item.warningCount ? `${item.warningCount} cảnh báo` : "",
            item.needsReviewCount
              ? `${item.needsReviewCount} cần xem xét`
              : "",
          ]
            .filter(Boolean)
            .join(" • ");

          const cardClasses =
            item.severity === "critical"
              ? "border-red-200 bg-red-50 text-red-900"
              : item.severity === "warning" || item.severity === "needs_review"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-blue-200 bg-blue-50 text-blue-900";

          return (
            <button
              key={item.section}
              type="button"
              onClick={() => onFindingClick?.(item.section)}
              className={`rounded-xl border p-3 text-left text-sm transition hover:-translate-y-0.5 hover:shadow-sm ${cardClasses}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{item.label}</span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold">
                  {item.count} điểm
                </span>
              </div>

              {description ? (
                <p className="mt-1 text-xs opacity-80">{description}</p>
              ) : (
                <p className="mt-1 text-xs opacity-80">Có điểm cần xem xét</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AIReviewAssistantPanel({
  run,
  findings = [],
  checklistSuggestions = [],
  sectionSummary = [],
  onRetry,
  isRetrying,
  onFindingClick,
  onInsertSuggestion,
}) {
  const status = run?.status || "NONE";
  const isCompleted = status === "COMPLETED";
  const retryDisabled = isRetrying || RETRY_BLOCKED_STATES.includes(status);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-600">
            <Bot size={20} />
            <h2 className="text-lg font-bold text-slate-950">
              Trợ lý AI gợi ý hỗ trợ xem xét
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Báo cáo AI chỉ hỗ trợ xem xét, không thay thế quyết định của quản trị viên.
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={retryDisabled}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-bold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={isRetrying ? "animate-spin" : ""} />
          {RETRY_BLOCKED_STATES.includes(status) ? "Đang xử lý…" : "Phân tích"}
        </button>
      </div>

      {!isCompleted && (
        <div className="mt-4">
          <AIStatusCard status={status} />
        </div>
      )}

      {isCompleted && (
        <div className="mt-4">
          <RiskSummaryCards run={run} />
        </div>
      )}

      {isCompleted && run?.summary && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
          <div className="mb-2 flex items-center gap-2 text-green-700">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase">
              Tóm tắt phân tích sơ bộ
            </span>
          </div>
          {run.summary}
        </div>
      )}

      {isCompleted && sectionSummary.length > 0 && (
        <SectionNavigationCards
          sectionSummary={sectionSummary}
          onFindingClick={onFindingClick}
        />
      )}

      {isCompleted && findings.length > 0 && (
        <div className="mt-4">
          <FindingsList
            findings={findings}
            onFindingClick={onFindingClick}
            onInsertSuggestion={onInsertSuggestion}
          />
        </div>
      )}

      {isCompleted && checklistSuggestions.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-bold text-slate-900">
            Gợi ý checklist cần xem xét
          </h3>

          <div className="mt-3 space-y-2">
            {checklistSuggestions.slice(0, 5).map((item) => (
              <div
                key={`${item.key}-${item.suggestedState}`}
                className="rounded-lg border border-white bg-white p-3 text-sm text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">
                    {CHECKLIST_LABELS[item.labelKey] ||
                      CHECKLIST_LABELS[item.key] ||
                      item.key}
                  </p>

                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                    {item.suggestedState}
                  </span>
                </div>

                <p className="mt-1 leading-6">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}