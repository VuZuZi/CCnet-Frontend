import { useState, useCallback, useMemo, useEffect } from "react";
import {
  X,
  PlusCircle,
  Eye,
  Pencil,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  CHECKLIST_LABELS,
  SEVERITY_LABELS,
  SEVERITY_CLASSES,
  SEVERITY_BADGE_CLASSES,
  SECTION_LABELS,
} from "./projectReview.constants";

/* ─────────────────────────────────────────────────────────────────────────────
   AdminFeedbackModal
   Props:
     open               boolean   — whether the modal is visible
     onClose            fn()      — called when user clicks X or Cancel
     onSubmit           fn(text)  — called with the final feedback string
     checklistSuggestions  array — AI checklist hints  [{key, suggestedState, reason}]
     findings           array — AI findings [{id,title,detail,severity,section,suggestedRevisionText,suggestedAdminQuestion}]
     initialText        string    — pre-filled feedback (e.g. existing decisionReason)
────────────────────────────────────────────────────────────────────────────── */
export default function AdminFeedbackModal({
  open,
  onClose,
  onSubmit,
  checklistSuggestions = [],
  findings = [],
  initialText = "",
}) {
  /* ── local state ── */
  const [text, setText] = useState(initialText);
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [expandedFinding, setExpandedFinding] = useState(null);

  useEffect(() => {
    if (open) {
      setText(initialText || "");
    }
  }, [open, initialText]);

  /* ── derived ── */
  const findingsBySeverity = useMemo(() => {
    const order = ["critical", "needs_review", "warning", "info"];
    return [...findings].sort(
      (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity)
    );
  }, [findings]);

  const previewLines = useMemo(() => {
    const parts = [];

    const checkedSuggestions = checklistSuggestions.filter(
      (s) => selectedSuggestions[s.key]
    );
    if (checkedSuggestions.length) {
      parts.push("📋 Vấn đề từ checklist AI:");
      checkedSuggestions.forEach((s) => {
        parts.push(`  • ${CHECKLIST_LABELS[s.key] || s.key}: ${s.reason || ""}`);
      });
    }

    const manual = String(text || "").trim();
    if (manual) {
      if (parts.length) parts.push("");
      parts.push(manual);
    }

    return parts.join("\n");
  }, [text, selectedSuggestions, checklistSuggestions]);

  /* ── handlers ── */
  const toggleSuggestion = (key) => {
    setSelectedSuggestions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const insertFindingText = useCallback((finding) => {
    const snippet = [
      finding.suggestedRevisionText
        ? `[${SEVERITY_LABELS[finding.severity] || finding.severity}] ${finding.title}: ${finding.suggestedRevisionText}`
        : `[${SEVERITY_LABELS[finding.severity] || finding.severity}] ${finding.title}: ${finding.detail}`,
    ].join("");

    setText((prev) => {
      const current = String(prev || "").trim();
      return current ? `${current}\n\n${snippet}` : snippet;
    });
  }, []);

  const handleSubmit = () => {
    if (typeof onSubmit === "function") {
      onSubmit(previewLines);
    }
    onClose?.();
  };

  if (!open) return null;

  /* ── render ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div
        className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Soạn phản hồi kiểm duyệt
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Chọn gợi ý AI, chèn điểm phát hiện, hoặc soạn thủ công. Nội dung
              sẽ được ghép vào phần lý do quyết định.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3-Column Body */}
        <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_minmax(0,1.4fr)] divide-x divide-slate-100 overflow-hidden">
          {/* ── Column 1: AI checklist suggestions ── */}
          <aside className="flex flex-col overflow-y-auto px-4 py-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Gợi ý checklist AI
            </p>
            {checklistSuggestions.length === 0 ? (
              <p className="text-xs text-slate-400">Không có gợi ý.</p>
            ) : (
              <div className="space-y-2">
                {checklistSuggestions.map((s) => {
                  const needsAttention =
                    s.suggestedState === "needs_review" ||
                    s.suggestedState === "unchecked";
                  const checked = Boolean(selectedSuggestions[s.key]);
                  return (
                    <label
                      key={s.key}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-colors ${
                        checked
                          ? "border-amber-300 bg-amber-50"
                          : needsAttention
                          ? "border-blue-200 bg-blue-50/50 hover:border-blue-300"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSuggestion(s.key)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold leading-5 text-slate-700">
                          {CHECKLIST_LABELS[s.key] || s.key}
                        </p>
                        {needsAttention && (
                          <p className="mt-0.5 flex items-center gap-1 font-bold text-blue-700">
                            <Info size={10} /> AI gợi ý
                          </p>
                        )}
                        {s.reason && (
                          <p className="mt-1 leading-5 text-slate-500 line-clamp-3">
                            {s.reason}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </aside>

          {/* ── Column 2: Findings list ── */}
          <div className="flex flex-col overflow-y-auto px-4 py-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Điểm phát hiện AI ({findings.length})
            </p>
            {findingsBySeverity.length === 0 ? (
              <p className="text-xs text-slate-400">Không có điểm phát hiện.</p>
            ) : (
              <div className="space-y-2">
                {findingsBySeverity.map((finding) => {
                  const isExpanded = expandedFinding === finding.id;
                  const severityClass =
                    SEVERITY_CLASSES[finding.severity] ||
                    "border-slate-200 bg-slate-50 text-slate-700";
                  const badgeClass =
                    SEVERITY_BADGE_CLASSES[finding.severity] ||
                    "bg-slate-100 text-slate-600 border-slate-200";

                  return (
                    <div
                      key={finding.id || finding.title}
                      className={`rounded-xl border p-3 text-xs ${severityClass}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${badgeClass}`}
                            >
                              {SEVERITY_LABELS[finding.severity] || finding.severity}
                            </span>
                            {finding.section && (
                              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                                {SECTION_LABELS[finding.section] || finding.section}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold leading-5">{finding.title}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            title="Xem chi tiết"
                            onClick={() =>
                              setExpandedFinding(isExpanded ? null : finding.id)
                            }
                            className="rounded-lg p-1 hover:bg-white/60"
                          >
                            {isExpanded ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                          <button
                            type="button"
                            title="Chèn vào phản hồi"
                            onClick={() => insertFindingText(finding)}
                            className="rounded-lg p-1 hover:bg-white/60"
                          >
                            <PlusCircle size={14} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 border-t border-current/10 pt-2">
                          <p className="leading-5 opacity-90">{finding.detail}</p>
                          {finding.suggestedAdminQuestion && (
                            <div className="rounded-lg bg-white/50 p-2 italic">
                              <span className="font-semibold not-italic">Câu hỏi: </span>
                              {finding.suggestedAdminQuestion}
                            </div>
                          )}
                          {finding.suggestedRevisionText && (
                            <div className="rounded-lg bg-white/50 p-2">
                              <span className="font-semibold">Gợi ý phản hồi: </span>
                              {finding.suggestedRevisionText}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => insertFindingText(finding)}
                            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-current/20 bg-white/60 px-2.5 py-1 text-[11px] font-bold hover:bg-white/90"
                          >
                            <PlusCircle size={11} /> Chèn vào phản hồi
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Column 3: Editor + Preview ── */}
          <div className="flex flex-col overflow-hidden px-5 py-4">
            {/* Editor */}
            <div className="flex flex-1 flex-col min-h-0">
              <div className="mb-2 flex items-center gap-2">
                <Pencil size={14} className="text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Phản hồi thủ công
                </p>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập phản hồi cho organizer. Có thể kết hợp nội dung được chèn tự động từ cột bên trái."
                className="min-h-[140px] flex-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm leading-7 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>

            {/* Preview */}
            <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
                <Eye size={14} className="text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Xem trước
                </p>
              </div>
              <div className="max-h-44 overflow-y-auto p-3">
                {previewLines ? (
                  <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-700 font-sans">
                    {previewLines}
                  </pre>
                ) : (
                  <p className="text-xs text-slate-400">
                    Chọn gợi ý hoặc soạn nội dung để xem trước…
                  </p>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="mt-3 flex gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>
                AI gợi ý mang tính tham khảo. Không thay thế quyết định của
                quản trị viên.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-500">
            {previewLines
              ? `${previewLines.length} ký tự`
              : "Chưa có nội dung"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!previewLines.trim()}
              className="h-10 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Áp dụng phản hồi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}