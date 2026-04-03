import { X, Download } from 'lucide-react';
import { chatAPI } from '../../api/chat.api';

function isImageAttachment(attachment) {
  return String(attachment?.mimetype || '').startsWith('image/');
}

function getAttachmentName(attachment) {
  return (
    attachment?.originalName ||
    attachment?.filename ||
    attachment?.name ||
    'Tệp đính kèm'
  );
}

export default function AttachmentPreviewModal({ attachment, onClose }) {
  if (!attachment) return null;

  const isImage = isImageAttachment(attachment);
  const fileName = getAttachmentName(attachment);
  const fileUrl = chatAPI.getAttachmentUrl(attachment);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Đóng preview"
      />

      <div className="relative z-[101] flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-slate-900">
              {fileName}
            </div>
            <div className="text-xs text-slate-500">
              {attachment?.mimetype || 'attachment'}
            </div>
          </div>

          <div className="ml-4 flex items-center gap-2">
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </a>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
          {isImage && fileUrl ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-lg"
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
              <div className="text-base font-bold text-slate-900">{fileName}</div>
              <div className="mt-2 text-sm text-slate-500">
                Không thể xem trước trực tiếp loại tệp này.
              </div>

              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-300"
                >
                  <Download className="h-4 w-4" />
                  Mở tệp
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}