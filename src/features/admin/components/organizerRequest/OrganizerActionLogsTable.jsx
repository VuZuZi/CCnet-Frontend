import {
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  UserRound,
} from "lucide-react";
import {
  ACTION_LABELS,
  ACTION_STYLES,
  formatDateTimeSingleLine,
  getActionIconComponent,
} from "../../utils/organizerActionLog.utils";

export default function OrganizerActionLogsTable({
  items,
  isLoading,
  isFetching,
  page,
  totalPages,
  visiblePages,
  onPageChange,
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[20px] font-black text-slate-900">
              Lịch sử Quản duyệt Tổ chức
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Trang {page} / {totalPages}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500">
            Đang hiển thị {items.length} bản ghi trên trang này
          </div>
        </div>
      </div>

      <div className="min-h-[460px] overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-slate-50/90">
            <tr className="text-left text-slate-500">
              <th className="w-[18%] px-6 py-4 font-bold">Hành động</th>
              <th className="w-[18%] px-6 py-4 font-bold">Quản trị viên</th>
              <th className="w-[18%] px-6 py-4 font-bold">Người đăng ký</th>
              <th className="w-[18%] px-6 py-4 font-bold">Tổ chức</th>
              <th className="w-[16%] px-6 py-4 font-bold">Lý do</th>
              <th className="w-[12%] px-6 py-4 font-bold">Thời gian</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 shadow-sm">
                    <Loader2 size={18} className="animate-spin text-amber-500" />
                    Đang tải lịch sử...
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-24 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <History size={24} />
                    </div>
                    <p className="mt-5 text-base font-bold text-slate-700">
                      Không tìm thấy lịch sử hoạt động nào
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((log) => {
                const actionLabel =
                  ACTION_LABELS[log.action] || log.action || "Hành động không xác định";
                const actionStyle =
                  ACTION_STYLES[log.action] ||
                  "border-slate-200 bg-slate-100 text-slate-700";
                const ActionIcon = getActionIconComponent(log.action);

                return (
                  <tr key={log._id} className="transition hover:bg-amber-50/20">
                    <td className="px-6 py-5 align-top">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${actionStyle}`}
                      >
                        <ActionIcon size={14} />
                        {actionLabel}
                      </span>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-[15px] font-black text-slate-900">
                          <UserRound size={14} className="text-slate-400" />
                          <span>{log.actorName || log.actorEmail || "--"}</span>
                        </div>
                        <div className="break-all text-sm text-slate-500">
                          {log.actorEmail || "--"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="space-y-1">
                        <div className="text-[15px] font-black text-slate-900">
                          {log.applicantName || "--"}
                        </div>
                        <div className="break-all text-sm text-slate-500">
                          {log.applicantEmail || "--"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        {log.organizationName || "--"}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        {log.reason || "Không có lý do."}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {formatDateTimeSingleLine(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-slate-100 px-6 py-5">
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isFetching}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                disabled={isFetching}
                className={`inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                  page === pageNumber
                    ? "bg-amber-500 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                } disabled:opacity-50`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isFetching}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}