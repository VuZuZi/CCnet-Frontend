import { Copy, Mail, User } from "lucide-react";

function getRoleBadgeClass(role) {
  const normalized = String(role || "user").toLowerCase();

  switch (normalized) {
    case "admin":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "organizer":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function RecipientUserList({
  title,
  users = [],
  emptyText = "Không có người dùng nào.",
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        users
          .map(
            (user) =>
              `${user.fullName} | ${user.email} | ${user.role} | ${user._id}`
          )
          .join("\n")
      );
    } catch {
      console.error("Sao chép người dùng nhận thất bại.");
    }
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} người nhận
          </p>
        </div>

        {users.length ? (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
          >
            <Copy size={12} />
            Sao chép người dùng
          </button>
        ) : null}
      </div>

      {users.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <p className="truncate text-base font-bold text-slate-900">
                      {user.fullName}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <p className="truncate text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <p className="mt-2 break-all text-xs text-slate-400">
                    ID: {user._id}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${getRoleBadgeClass(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}