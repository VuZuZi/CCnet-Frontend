import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Mail,
} from "lucide-react";
import {
  getInitials,
  getRoleClass,
  getStatusMeta,
} from "../../utils/adminUser.utils";

export function UserDirectoryTable({
  users,
  isLoading,
  isFetching,
  page,
  totalPages,
  visiblePages,
  pendingBanUserId,
  onPageChange,
  onOpenDetail,
  onOpenBanModal,
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Danh mục người dùng</h2>
            <p className="mt-1 text-sm text-slate-500">
              Trang {page} / {totalPages}
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Đang hiển thị {users.length} người dùng trên trang này
          </div>
        </div>
      </div>

      <div className="min-h-[420px] overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="w-[42%] px-5 py-3 font-bold text-slate-600">Người dùng</th>
              <th className="w-[20%] px-5 py-3 font-bold text-slate-600">Vai trò</th>
              <th className="w-[18%] px-5 py-3 font-bold text-slate-600">Trạng thái</th>
              <th className="w-[20%] px-5 py-3 text-right font-bold text-slate-600">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="px-5 py-14 text-center">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-500">
                    <Loader2 size={18} className="animate-spin text-amber-500" />
                    Đang tải danh sách người dùng...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-20 text-center text-slate-400">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const statusMeta = getStatusMeta(user.normalizedStatus);
                const isBanned = user.normalizedStatus === "banned";
                const isBanPending = pendingBanUserId === user._id;
                const isBusy = isBanPending;

                return (
                  <tr
                    key={user._id}
                    className="border-b border-slate-100/80 transition hover:bg-slate-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-all duration-200 hover:border-amber-300 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_12px_28px_rgba(245,158,11,0.10)]">
                        <div className="flex min-w-0 items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt="Ảnh đại diện"
                              className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                              {getInitials(user.fullName)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                              {user.fullName || "Người dùng chưa đặt tên"}
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
                              <Mail
                                size={13}
                                strokeWidth={2.1}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="truncate">{user.email || "--"}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenDetail(user)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                          aria-label={`Xem chi tiết của ${user.fullName || "người dùng"}`}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} strokeWidth={2.1} />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleClass(
                          user.role
                        )}`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenBanModal(user)}
                          disabled={isBusy}
                          className={`inline-flex min-w-[105px] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isBanned
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {isBanPending ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : isBanned ? (
                            <CheckCircle2 size={13} strokeWidth={2.2} />
                          ) : (
                            <Ban size={13} strokeWidth={2.2} />
                          )}
                          {isBanPending ? "..." : isBanned ? "Mở khóa" : "Khóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-slate-100 px-5 py-4">
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isFetching}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} strokeWidth={2.3} />
            </button>

            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                disabled={isFetching}
                className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                  page === pageNumber
                    ? "bg-amber-500 text-white"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight size={16} strokeWidth={2.3} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default UserDirectoryTable;