import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ExternalLink,
  Download,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"];
const PDF_EXTENSIONS = ["pdf"];

function getExtension(url, originalName) {
  const name = originalName || url || "";
  const match = String(name).match(/\.(\w+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : "";
}

function getFileUrl(file) {
  return file?.url || file?.secureUrl || "";
}

function getFileName(file) {
  return file?.originalName || file?.publicId || "Tài liệu";
}

function getFileType(url, originalName, resourceType) {
  const ext = getExtension(url, originalName);

  if (IMAGE_EXTENSIONS.includes(ext) || resourceType === "image") {
    return "image";
  }

  if (PDF_EXTENSIONS.includes(ext) || resourceType === "pdf") {
    return "pdf";
  }

  return "unknown";
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function OrganizerDocumentPreviewModal({
  open = true,
  title,
  file,
  onClose,
}) {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open || !file) return undefined;

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, file, handleKeyDown]);

  if (!open || !file) return null;

  const url = getFileUrl(file);
  const name = title || getFileName(file);
  const originalName = getFileName(file);
  const fileType = getFileType(url, file.originalName, file.resourceType);
  const fileSize = formatBytes(file.bytes);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/65 px-4 py-5 backdrop-blur-[2px]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <div
        className={`relative flex max-h-[calc(100vh-40px)] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)] ${
          fileType === "image" ? "max-w-fit" : "max-w-6xl"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              {fileType === "image" ? (
                <ImageIcon size={19} />
              ) : (
                <FileText size={19} />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900">
                {name}
              </h3>
              <p className="mt-0.5 truncate text-sm font-medium text-slate-500">
                {originalName}
                {fileSize ? ` • ${fileSize}` : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {url && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 md:inline-flex"
                >
                  <ExternalLink size={15} />
                  Mở tab mới
                </a>

                <a
                  href={url}
                  download={file.originalName || true}
                  className="inline-flex h-10 items-center gap-2 rounded-2xl bg-amber-400 px-4 text-sm font-black text-slate-950 shadow-sm shadow-amber-200 transition hover:bg-amber-500"
                >
                  <Download size={15} />
                  Tải xuống
                </a>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Đóng xem trước"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {fileType === "image" && (
          <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
            <img
              src={url}
              alt={name}
              className="block max-h-[calc(100vh-170px)] max-w-[calc(100vw-72px)] rounded-2xl object-contain"
              draggable={false}
            />
          </div>
        )}

        {fileType === "pdf" && (
          <div className="min-h-0 flex-1 bg-slate-100 p-4">
            <iframe
              src={url}
              title={name}
              className="h-[calc(100vh-170px)] min-h-[520px] w-[min(1080px,calc(100vw-72px))] rounded-2xl border border-slate-200 bg-white shadow-sm"
            />
          </div>
        )}

        {fileType === "unknown" && (
          <div className="flex h-[520px] w-[min(720px,calc(100vw-72px))] flex-col items-center justify-center gap-5 bg-slate-50 px-5 text-center">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <FileText size={46} className="text-slate-400" />
            </div>

            <div>
              <p className="text-lg font-black text-slate-900">{name}</p>

              {file.format && (
                <p className="mt-1 text-sm text-slate-500">
                  Loại tệp: {String(file.format).toUpperCase()}
                </p>
              )}

              {fileSize && (
                <p className="text-sm text-slate-500">
                  Kích thước: {fileSize}
                </p>
              )}

              <p className="mt-3 text-sm font-medium text-slate-500">
                Không thể xem trước loại tệp này trong trình duyệt.
              </p>
            </div>

            {url && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  <ExternalLink size={15} />
                  Mở trong tab mới
                </a>

                <a
                  href={url}
                  download={file.originalName || true}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-500"
                >
                  <Download size={15} />
                  Tải xuống
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}