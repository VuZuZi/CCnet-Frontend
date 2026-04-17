import { useEffect, useState } from "react";
import { AlertTriangle, ShieldBan, Trash2, X, Loader2 } from "lucide-react";

const ReportModal = ({ isOpen, onClose, reportId, onSubmit }) => {
  const [selectedActions, setSelectedActions] = useState([]);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedActions([]);
      setResolutionNote("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckboxChange = (actionValue) => {
    if (isSubmitting) return;

    setSelectedActions((prev) =>
      prev.includes(actionValue)
        ? prev.filter((a) => a !== actionValue)
        : [...prev, actionValue]
    );
  };

  const handleConfirm = async () => {
    const actionsToSend =
      selectedActions.length > 0 ? selectedActions : ["mark_resolved"];

    try {
      setIsSubmitting(true);
      await onSubmit(
        reportId,
        actionsToSend,
        resolutionNote?.trim() || "Không có ghi chú nào được cung cấp"
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h4 className="text-xl font-black tracking-tight text-slate-900">
              Giải quyết báo cáo
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Chọn các hành động kiểm duyệt và để lại ghi chú nội bộ.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-white p-2 text-amber-600 shadow-sm">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Các hành động quản trị
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  Chọn một hoặc nhiều hành động. Nếu bạn không chọn hành động nào, báo cáo sẽ chỉ được đánh dấu là đã giải quyết.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                selectedActions.includes("delete_content")
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={selectedActions.includes("delete_content")}
                onChange={() => handleCheckboxChange("delete_content")}
                disabled={isSubmitting}
              />

              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-xl bg-red-100 p-2 text-red-600">
                  <Trash2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Xóa nội dung
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Xóa vĩnh viễn nội dung bị báo cáo khỏi nền tảng.
                  </p>
                </div>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                selectedActions.includes("ban_user")
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={selectedActions.includes("ban_user")}
                onChange={() => handleCheckboxChange("ban_user")}
                disabled={isSubmitting}
              />

              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-xl bg-rose-100 p-2 text-rose-600">
                  <ShieldBan size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Cấm người dùng</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Đình chỉ tài khoản của tác giả ngay lập tức.
                  </p>
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
              Ghi chú quyết định
            </label>
            <textarea
              rows="4"
              placeholder="Giải thích lý do thực hiện hành động này..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận hành động"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;