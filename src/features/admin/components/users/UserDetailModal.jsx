import { useEffect } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleOff,
  CircleUserRound,
  Mail,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import {
  formatDateTime,
  getInitials,
  getRoleClass,
  getStatusMeta,
  normalizeUserStatus,
} from "../../utils/adminUser.utils";

function InfoItem({ icon, label, value, mono = false, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
    red: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            toneMap[tone] || toneMap.slate
          }`}
        >
          {icon}
        </div>

        <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </div>
      </div>

      <div
        className={`break-all text-sm font-semibold text-slate-800 ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      >
        {value || "--"}
      </div>
    </div>
  );
}

function UserDetailModal({ open, user, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
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
  }, [open, onClose]);

  if (!open || !user) return null;

  const statusMeta = getStatusMeta(normalizeUserStatus(user));

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Đóng hộp thoại"
      />

      <div
        className="relative z-10 flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Ảnh đại diện"
                className="h-16 w-16 rounded-3xl object-cover ring-1 ring-slate-200 sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-xl font-black text-slate-600 ring-1 ring-slate-200 sm:h-20 sm:w-20 sm:text-2xl">
                {getInitials(user.fullName)}
              </div>
            )}

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                <CircleUserRound size={12} strokeWidth={2.3} />
                Chi tiết người dùng
              </div>

              <h3 className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                {user.fullName || "Người dùng chưa đặt tên"}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getRoleClass(
                    user.role
                  )}`}
                >
                  {user.role || "user"}
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem
              icon={<Mail size={16} strokeWidth={2.3} />}
              label="Email"
              value={user.email}
              tone="blue"
            />

            <InfoItem
              icon={<Shield size={16} strokeWidth={2.3} />}
              label="Vai trò"
              value={user.role || "user"}
              tone="violet"
            />

            <InfoItem
              icon={<UserRound size={16} strokeWidth={2.3} />}
              label="ID Người dùng"
              value={user._id}
              mono
              tone="amber"
            />

            <InfoItem
              icon={<CircleOff size={16} strokeWidth={2.3} />}
              label="Trạng thái tài khoản"
              value={statusMeta.label}
              tone={statusMeta.label === "Banned" ? "red" : "green"}
            />

            <InfoItem
              icon={<CheckCircle2 size={16} strokeWidth={2.3} />}
              label="Hoạt động"
              value={user.isActive === false ? "Không" : "Có"}
              tone={user.isActive === false ? "red" : "green"}
            />

            <InfoItem
              icon={<CalendarDays size={16} strokeWidth={2.3} />}
              label="Ngày tạo"
              value={formatDateTime(user.createdAt)}
              tone="slate"
            />

            <InfoItem
              icon={<CalendarDays size={16} strokeWidth={2.3} />}
              label="Cập nhật lần cuối"
              value={formatDateTime(user.updatedAt)}
              tone="slate"
            />

            {"phone" in user ? (
              <InfoItem
                icon={<UserRound size={16} strokeWidth={2.3} />}
                label="Số điện thoại"
                value={user.phone}
                tone="slate"
              />
            ) : null}

            {"location" in user ? (
              <InfoItem
                icon={<UserRound size={16} strokeWidth={2.3} />}
                label="Vị trí"
                value={user.location}
                tone="slate"
              />
            ) : null}

            {"headline" in user ? (
              <InfoItem
                icon={<UserRound size={16} strokeWidth={2.3} />}
                label="Chức danh"
                value={user.headline}
                tone="slate"
              />
            ) : null}

            {"about" in user ? (
              <div className="md:col-span-2">
                <InfoItem
                  icon={<UserRound size={16} strokeWidth={2.3} />}
                  label="Giới thiệu"
                  value={user.about}
                  tone="slate"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;