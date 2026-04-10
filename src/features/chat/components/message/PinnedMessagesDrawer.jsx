import { useMemo } from 'react';
import { CornerDownRight, Pin, X } from 'lucide-react';
import { chatAPI } from '@/features/chat/api/chat.api';

function formatTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return '';
  }
}

function getSenderName(item) {
  return (
    item?.message?.sender?.fullName ||
    item?.message?.sender?.name ||
    item?.message?.sender?.email ||
    'Người dùng'
  );
}

function getPinnedByName(item) {
  return (
    item?.pinnedBy?.fullName ||
    item?.pinnedBy?.name ||
    item?.pinnedBy?.email ||
    'Người dùng'
  );
}

function getPreviewText(item) {
  const text = String(item?.message?.text || '').trim();
  if (text) return text;

  const attachments = Array.isArray(item?.message?.attachments)
    ? item.message.attachments.length
    : 0;

  if (attachments > 0) {
    return attachments === 1
      ? 'Tin nhắn có 1 tệp đính kèm'
      : `Tin nhắn có ${attachments} tệp đính kèm`;
  }

  return 'Tin nhắn đã ghim';
}

export default function PinnedMessagesDrawer({
  open = false,
  pinnedMessages = [],
  onClose,
  onUnpin,
  onJumpToMessage,
}) {
  const safeMessages = useMemo(
    () => (Array.isArray(pinnedMessages) ? pinnedMessages : []),
    [pinnedMessages]
  );

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-[400px] border-l border-amber-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Pin className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Tin nhắn đã ghim
                </h3>
                <p className="text-xs text-slate-500">
                  Chạm để mở đúng vị trí tin nhắn
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!safeMessages.length ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-6 text-center">
                <Pin className="mb-3 h-5 w-5 text-amber-500" />
                <p className="text-sm font-medium text-slate-700">
                  Chưa có tin nhắn nào được ghim
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Hãy ghim các nội dung quan trọng để xem lại nhanh hơn
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {safeMessages.map((item) => {
                  const messageId = String(item?.messageId || item?.message?._id || '');
                  const avatar =
                    item?.message?.sender?.avatar
                      ? chatAPI.getAttachmentUrl({ url: item.message.sender.avatar })
                      : '';

                  return (
                    <button
                      key={messageId}
                      type="button"
                      onClick={() => onJumpToMessage?.(messageId)}
                      className="block w-full rounded-2xl border border-amber-100 bg-white p-4 text-left shadow-[0_8px_22px_rgba(245,158,11,0.08)] transition hover:-translate-y-[1px] hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-[0_12px_28px_rgba(245,158,11,0.12)]"
                    >
                      <div className="flex items-start gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={getSenderName(item)}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 ring-2 ring-amber-100">
                            {getSenderName(item).charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {getSenderName(item)}
                            </span>

                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              Ghim bởi {getPinnedByName(item)}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {getPreviewText(item)}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <CornerDownRight className="h-3.5 w-3.5" />
                              <span>{formatTime(item?.pinnedAt)}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onUnpin?.(messageId);
                              }}
                              className="rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              Bỏ ghim
                            </button>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}