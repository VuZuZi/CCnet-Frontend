import { useEffect } from "react";
import { Users, X } from "lucide-react";
import RecipientUserList from "./RecipientUserList";
import RecipientIdList from "./RecipientIdList";

export default function RecipientsDetailsModal({
  open,
  onClose,
  requestedUsers = [],
  resolvedRecipients = [],
  userIds = [],
  resolvedRecipientIds = [],
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Đóng hộp thoại người nhận"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Users size={20} />
            </div>

            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                Chi tiết người nhận
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Đầy đủ thông tin người nhận được yêu cầu và thực tế cho thông báo này.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
          <div className="grid gap-5 xl:grid-cols-2">
            <RecipientUserList
              title="Người dùng cụ thể từ yêu cầu"
              users={requestedUsers}
              emptyText="Không có dữ liệu người dùng được yêu cầu."
            />

            <RecipientUserList
              title="Người nhận thực tế"
              users={resolvedRecipients}
              emptyText="Không có dữ liệu người nhận thực tế."
            />

            <RecipientIdList
              title="ID người dùng cụ thể từ yêu cầu"
              ids={userIds}
              emptyText="Không có ID người dùng được yêu cầu."
            />

            <RecipientIdList
              title="ID người nhận thực tế"
              ids={resolvedRecipientIds}
              emptyText="Không có ID người nhận thực tế."
            />
          </div>
        </div>
      </div>
    </div>
  );
}