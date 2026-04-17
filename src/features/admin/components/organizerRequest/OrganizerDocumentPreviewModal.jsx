import { useEffect } from "react";
import { Download, FileText, X } from "lucide-react";
import {
  downloadDocumentFile,
  getDocumentFileName,
  getDocumentHref,
  isImageDocument,
  isPdfDocument,
} from "./organizerDocument.utils";

export function OrganizerDocumentPreviewModal({
  open,
  title,
  file,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const originalOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !file) return null;

  const href = getDocumentHref(file);
  const fileName = getDocumentFileName(file, title);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng xem trước"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70"
      />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900 md:text-lg">
              {title}
            </h3>
            <p className="mt-1 truncate text-sm text-slate-500">{fileName}</p>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadDocumentFile(file, title)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
            >
              <Download size={16} />
              Tải xuống
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-6">
          {isImageDocument(file) ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <img
                src={href}
                alt={title}
                className="max-h-[72vh] max-w-full rounded-2xl bg-white object-contain shadow-sm"
              />
            </div>
          ) : isPdfDocument(file) ? (
            <iframe
              src={href}
              title={fileName}
              className="h-[72vh] w-full rounded-2xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <FileText size={40} className="text-slate-400" />
              <p className="mt-4 text-base font-semibold text-slate-800">
                Chế độ xem trước không hỗ trợ loại tệp này
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Vui lòng tải tệp xuống để mở.
              </p>
              <button
                type="button"
                onClick={() => downloadDocumentFile(file, title)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
              >
                <Download size={16} />
                Tải tệp xuống
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizerDocumentPreviewModal;