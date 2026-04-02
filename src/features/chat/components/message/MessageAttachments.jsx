import { FileText, Download } from 'lucide-react';
import { chatAPI } from '../../api/chat.api';
import {
  isImageAttachment,
  pickFilename,
} from '../../utils/message';

export default function MessageAttachments({
  attachments = [],
  onPreviewImage,
  compact = false,
}) {
  if (!Array.isArray(attachments) || !attachments.length) return null;

  const imageClass = compact
    ? 'max-h-[110px] w-full object-cover'
    : 'max-h-[180px] w-full object-cover';

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const resolvedUrl = chatAPI.getAttachmentUrl(attachment);
        const key = `${resolvedUrl || attachment?.filename || 'att'}-${index}`;
        const isImage = isImageAttachment(attachment);
        const fileName = pickFilename(attachment);

        if (isImage) {
          if (!resolvedUrl) {
            return (
              <div
                key={key}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500 shadow-sm"
              >
                Ảnh không có đường dẫn để xem trước.
              </div>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                onPreviewImage?.({
                  ...attachment,
                  url: resolvedUrl,
                })
              }
              className="block w-full overflow-hidden rounded-2xl border border-amber-200 bg-white text-left shadow-sm transition hover:scale-[1.01]"
            >
              <img
                src={resolvedUrl}
                alt={fileName}
                className={imageClass}
              />
            </button>
          );
        }

        return (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {fileName}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {attachment?.mimetype || 'Tệp đính kèm'}
                </div>
              </div>
            </div>

            {resolvedUrl ? (
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Mở
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}