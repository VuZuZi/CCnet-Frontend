import { Eye, Mail, Users } from "lucide-react";

function RoleBadge({ role }) {
  const normalized = String(role || "user").toLowerCase();

  const classMap = {
    admin: "border-violet-200 bg-violet-50 text-violet-700",
    organizer: "border-amber-200 bg-amber-50 text-amber-700",
    user: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
        classMap[normalized] || classMap.user
      }`}
    >
      {normalized}
    </span>
  );
}

export default function RecipientsPreviewCard({
  requestedUsers = [],
  resolvedRecipients = [],
  resolvedRecipientCount = 0,
  onOpen,
}) {
  const previewUsers =
    resolvedRecipients.length > 0
      ? resolvedRecipients.slice(0, 3)
      : requestedUsers.slice(0, 3);

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-slate-500" />
          <h4 className="text-sm font-black tracking-tight text-slate-900">
            Xem trước người nhận
          </h4>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
        >
          <Eye size={12} />
          Xem người nhận
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Người dùng được yêu cầu
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {requestedUsers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Người nhận thực tế
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {resolvedRecipientCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Xem trước
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {previewUsers.length} người dùng
          </p>
        </div>
      </div>

      {previewUsers.length ? (
        <div className="mt-4 grid gap-3">
          {previewUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.fullName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <RoleBadge role={user.role} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          Không có bản xem trước người nhận nào.
        </div>
      )}
    </div>
  );
}