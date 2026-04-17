import { Save } from "lucide-react";

export function Step1SaveDraftModal({
  isOpen,
  draftMeta,
  setDraftMeta,
  onClose,
  onConfirm,
  isPending,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
        <h3 className="text-lg font-black text-slate-900">Lưu bản draft</h3>
        <p className="mt-1 text-sm text-slate-500">
          Đặt tên draft và chọn loại dự án trước khi lưu. Bạn có thể tiếp tục
          chỉnh sửa sau.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Tên draft
            </label>
            <input
              value={draftMeta.title}
              onChange={(event) =>
                setDraftMeta((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              placeholder="Nhập tên draft..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Loại dự án
            </label>
            <select
              value={draftMeta.projectType}
              onChange={(event) =>
                setDraftMeta((prev) => ({
                  ...prev,
                  projectType: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            >
              <option value="FUNDED">Funded Project</option>
              <option value="VOLUNTEER_ONLY">Volunteer Only</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={14} />
            Lưu draft
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step1SaveDraftModal;