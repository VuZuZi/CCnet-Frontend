import { AlertTriangle } from "lucide-react";
import { MANUAL_AI_BYPASS_WARNING } from "./projectReview.constants";

export default function ManualAIBypassConfirmModal({
  open,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Xác nhận kiểm duyệt thủ công
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {MANUAL_AI_BYPASS_WARNING}
            </p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          rows={4}
          className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
          placeholder="Ghi chú nội bộ về lý do phê duyệt khi AI chưa hiện hành."
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
          >
            Xác nhận phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
}
