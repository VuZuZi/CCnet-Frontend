import { ChevronRight, Pin } from 'lucide-react';

function getPreviewText(item) {
  const text = String(item?.message?.text || '').trim();
  if (text) return text;

  const attachments = Array.isArray(item?.message?.attachments)
    ? item.message.attachments.length
    : 0;

  if (attachments > 0) {
    return attachments === 1
      ? '1 tệp đính kèm'
      : `${attachments} tệp đính kèm`;
  }

  return 'Tin nhắn đã ghim';
}

export default function PinnedMessagesBar({
  pinnedMessages = [],
  onOpen,
}) {
  const count = Array.isArray(pinnedMessages) ? pinnedMessages.length : 0;
  if (!count) return null;

  const latest = pinnedMessages[0];
  const preview = getPreviewText(latest);

  return (
    <div className="px-3 pt-2">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/95 via-yellow-50/90 to-white px-3.5 py-2.5 text-left shadow-[0_6px_18px_rgba(245,158,11,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(245,158,11,0.14)]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700 ring-1 ring-amber-200/70">
          <Pin className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-800">
              {count} tin nhắn đã ghim
            </span>

            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Quan trọng
            </span>
          </div>

          <p className="mt-0.5 truncate text-sm text-slate-600">
            {preview}
          </p>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-amber-600 transition group-hover:bg-amber-100/70">
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}