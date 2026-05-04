import {
  AlertTriangle,
  CheckCircle2,
  Info,
  PlusCircle,
  Send,
  XCircle,
} from "lucide-react";
import {
  AI_STATUS_LABELS,
  CHECKLIST_LABELS,
  MANUAL_AI_BYPASS_WARNING,
} from "./projectReview.constants";

export default function AdminDecisionPanel({
  checklist,
  onChecklistChange,
  decisionReason,
  onReasonChange,
  onDecision,
  isSubmitting,
  isDecisionCompleted = false,
  aiIsCurrent,
  aiStatus,
  revisionSuggestions = [],
  checklistSuggestions = [],
  onOpenFeedbackModal,
}) {
  const checklistKeys = Object.keys(CHECKLIST_LABELS);
  const completedCount = checklistKeys.filter((key) => checklist[key]).length;
  const allComplete = completedCount === checklistKeys.length;

  const insertSuggestion = (text) => {
    const current = String(decisionReason || "").trim();
    onReasonChange(current ? `${current}\n\n${text}` : text);
  };

  const aiStateWarning =
    !aiIsCurrent && (aiStatus === "PENDING" || aiStatus === "RUNNING")
      ? `AI đang ${
          aiStatus === "PENDING" ? "chờ xử lý" : "phân tích"
        }. Quản trị viên có thể kiểm duyệt thủ công nếu cần.`
      : !aiIsCurrent
        ? MANUAL_AI_BYPASS_WARNING
        : null;

  return (
    <aside className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
      <h2 className="text-lg font-bold text-slate-950">Quyết định kiểm duyệt</h2>
      <p className="mt-1 text-sm text-slate-500">
        Hoàn tất checklist trước khi phê duyệt.
      </p>

      {aiStatus && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">AI:</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              aiStatus === "COMPLETED"
                ? "border border-green-200 bg-green-50 text-green-700"
                : aiStatus === "PENDING" || aiStatus === "RUNNING"
                  ? "border border-blue-200 bg-blue-50 text-blue-700"
                  : aiStatus === "FAILED"
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : "border border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {AI_STATUS_LABELS[aiStatus] || "Chưa có dữ liệu"}
          </span>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700">Checklist</span>
          <span className="text-slate-500">
            {completedCount}/{checklistKeys.length}
          </span>
        </div>

        {checklistKeys.map((key) => {
          const suggestion = checklistSuggestions?.find((s) => s.key === key);
          const needsReview =
            suggestion?.suggestedState === "needs_review" ||
            suggestion?.suggestedState === "unchecked";

          return (
            <label
              key={key}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                needsReview && !checklist[key]
                  ? "border-blue-300 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-50"
                  : "border-slate-200 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(checklist[key])}
                disabled={isDecisionCompleted}
                onChange={(event) =>
                  onChecklistChange(key, event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="flex-1">
                <span className="font-medium text-slate-700">
                  {CHECKLIST_LABELS[key]}
                </span>

                {needsReview && !checklist[key] && (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                    <Info size={12} /> AI gợi ý cần kiểm tra kỹ
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {aiStateWarning && !isDecisionCompleted && (
        <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>{aiStateWarning}</p>
        </div>
      )}

      <label className="mt-4 block">
        <span className="text-sm font-bold text-slate-700">Lý do / phản hồi</span>

        <textarea
          value={decisionReason}
          disabled={isDecisionCompleted}
          onChange={(event) => onReasonChange(event.target.value)}
          rows={8}
          className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="Nhập phản hồi cho organizer khi yêu cầu chỉnh sửa hoặc từ chối."
        />

        {!isDecisionCompleted && (
          <button
            type="button"
            onClick={onOpenFeedbackModal}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100"
          >
            Soạn phản hồi chi tiết
          </button>
        )}
      </label>

      {!isDecisionCompleted && revisionSuggestions.length ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-bold uppercase text-slate-500">
            Gợi ý phản hồi từ AI
          </p>

          {revisionSuggestions.slice(0, 4).map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => insertSuggestion(text)}
              className="flex w-full items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs leading-5 text-slate-700 hover:border-amber-300 hover:bg-amber-50"
            >
              <PlusCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
              <span>{text}</span>
            </button>
          ))}
        </div>
      ) : null}

      {isDecisionCompleted ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700">
          Quyết định kiểm duyệt đã được ghi nhận.
        </div>
      ) : (
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            disabled={isSubmitting || !allComplete}
            onClick={() => onDecision("APPROVED")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            Phê duyệt
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onDecision("REVISION_REQUESTED")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            Yêu cầu chỉnh sửa
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onDecision("REJECTED")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle size={16} />
            Từ chối
          </button>
        </div>
      )}

      {!allComplete && !isDecisionCompleted && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Cần hoàn tất toàn bộ checklist trước khi phê duyệt. Vẫn có thể yêu cầu
          chỉnh sửa hoặc từ chối nếu phát hiện rủi ro.
        </p>
      )}
    </aside>
  );
}