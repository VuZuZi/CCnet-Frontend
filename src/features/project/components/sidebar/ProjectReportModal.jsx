import { REPORT_REASONS } from "./utils/projectSidebar.utils";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";

export function ProjectReportModal({
  isOpen,
  onClose,
  reportReason,
  setReportReason,
  reportDescription,
  setReportDescription,
  reportError,
  onSubmit,
  isReporting,
}) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Báo cáo dự án</h3>
            <p className="text-sm text-slate-500">
              Gửi báo cáo đến quản trị viên để kiểm duyệt.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
          {reportError ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {reportError}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Lý do báo cáo
            </label>
            <select
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            >
              <option value="">Chọn lý do</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mô tả thêm (tùy chọn)
            </label>
            <textarea
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              placeholder="Bạn có thể mô tả chi tiết hơn về vấn đề"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isReporting}
              className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReporting ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectReportModal;
