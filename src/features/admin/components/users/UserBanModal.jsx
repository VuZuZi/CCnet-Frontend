import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

function UserBanModal({
  open,
  title,
  description,
  confirmText,
  confirmClassName,
  loading,
  requireReason = false,
  reason = "",
  onReasonChange,
  reasonLabel = "Reason",
  reasonPlaceholder = "Enter reason...",
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const isReasonInvalid = requireReason && !String(reason || "").trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => !loading && onClose?.()}
        aria-label="Close modal"
      />

      <div
        className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <AlertTriangle size={20} strokeWidth={2.2} />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} strokeWidth={2.3} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {reasonLabel}
          </label>

          <textarea
            rows={4}
            value={reason}
            onChange={(event) => onReasonChange?.(event.target.value)}
            placeholder={reasonPlaceholder}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${
              isReasonInvalid
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
            }`}
            disabled={loading}
          />

          {isReasonInvalid ? (
            <p className="text-xs font-semibold text-red-600">
              Reason is required for this action.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || isReasonInvalid}
            className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${confirmClassName}`}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserBanModal;