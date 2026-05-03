import { useEffect, useCallback } from "react";
import { X, ExternalLink, Download, FileText, Image as ImageIcon } from "lucide-react";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"];
const PDF_EXTENSIONS = ["pdf"];

function getExtension(url, originalName) {
  const name = originalName || url || "";
  const match = String(name).match(/\.(\w+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : "";
}

function getFileType(url, originalName, resourceType) {
  const ext = getExtension(url, originalName);
  if (IMAGE_EXTENSIONS.includes(ext) || resourceType === "image") return "image";
  if (PDF_EXTENSIONS.includes(ext) || resourceType === "pdf") return "pdf";
  return "unknown";
}

export default function DocumentPreviewModal({ file, onClose }) {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!file) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [file, handleKeyDown]);

  if (!file) return null;

  const url = file.url || file.secureUrl || "";
  const name = file.originalName || file.publicId || "Tài liệu";
  const fileType = getFileType(url, file.originalName, file.resourceType);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-2 overflow-hidden">
            {fileType === "image" ? (
              <ImageIcon size={16} className="shrink-0 text-amber-600" />
            ) : (
              <FileText size={16} className="shrink-0 text-amber-600" />
            )}
            <span className="truncate text-sm font-bold text-slate-800">{name}</span>
          </div>
          <div className="flex items-center gap-1">
            {url && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                >
                  <ExternalLink size={13} />
                  Mở trong tab mới
                </a>
                <a
                  href={url}
                  download={file.originalName || true}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                >
                  <Download size={13} />
                  Tải xuống
                </a>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {fileType === "image" && (
            <div className="flex items-center justify-center">
              <img
                src={url}
                alt={name}
                className="max-h-[75vh] max-w-full rounded-xl object-contain"
              />
            </div>
          )}

          {fileType === "pdf" && (
            <iframe
              src={url}
              title={name}
              className="h-[75vh] w-full rounded-xl border border-slate-200"
            />
          )}

          {fileType === "unknown" && (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="rounded-2xl bg-slate-100 p-4">
                <FileText size={40} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-slate-800">{name}</p>
                {file.format && (
                  <p className="mt-1 text-sm text-slate-500">
                    Loại tệp: {String(file.format).toUpperCase()}
                  </p>
                )}
                {file.bytes && (
                  <p className="text-sm text-slate-500">
                    Kích thước: {(file.bytes / 1024).toFixed(1)} KB
                  </p>
                )}
                <p className="mt-3 text-sm text-slate-500">
                  Không thể xem trước loại tệp này trong trình duyệt.
                </p>
              </div>
              <div className="flex gap-2">
                {url && (
                  <>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                    >
                      <ExternalLink size={15} />
                      Mở trong tab mới
                    </a>
                    <a
                      href={url}
                      download={file.originalName || true}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 hover:bg-amber-500"
                    >
                      <Download size={15} />
                      Tải xuống
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
