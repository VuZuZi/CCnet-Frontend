import {
  LoaderCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { chatAPI } from "../../api/chat.api";
import { isImageAttachment, pickFilename } from "../../utils/message";

function formatFileSize(bytes = 0) {
  const value = Number(bytes || 0);

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getCompactFileMeta(attachment) {
  if (attachment?.size) {
    return formatFileSize(attachment.size);
  }

  return "Tệp đính kèm";
}

function LoadingFileCard({ attachment, compact = false }) {
  const fileName = pickFilename(attachment);

  return (
    <div
      className={`border border-slate-200 bg-white/95 shadow-sm ${
        compact ? "rounded-[20px] px-3 py-2.5" : "rounded-3xl px-4 py-3"
      }`}
    >
      <div className={`flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
        <div
          className={`shrink-0 rounded-full bg-slate-100 text-slate-700 ${
            compact
              ? "flex h-8 w-8 items-center justify-center"
              : "flex h-10 w-10 items-center justify-center"
          }`}
        >
          <FileText className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`line-clamp-2 font-semibold text-slate-800 ${
              compact ? "text-[12px] leading-4" : "text-sm leading-5"
            }`}
          >
            {fileName || "Đang chuẩn bị tệp..."}
          </div>
          <div className={`mt-0.5 text-slate-500 ${compact ? "text-[10px]" : "text-xs"}`}>
            Đang tải lên...
          </div>
        </div>

        <LoaderCircle
          className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} shrink-0 animate-spin text-slate-400`}
        />
      </div>
    </div>
  );
}

function LoadingImageCard({ attachment, onPreviewImage, compact = false }) {
  const resolvedUrl = chatAPI.getAttachmentUrl(attachment);

  return (
    <div
      className={`overflow-hidden border border-amber-200 bg-white shadow-sm ${
        compact ? "rounded-[20px]" : "rounded-3xl"
      }`}
    >
      {resolvedUrl ? (
        <button
          type="button"
          onClick={() =>
            onPreviewImage?.({
              ...attachment,
              url: resolvedUrl,
            })
          }
          className="relative block w-full text-left"
        >
          <img
            src={resolvedUrl}
            alt={pickFilename(attachment) || "Đang tải ảnh"}
            className={
              compact
                ? "max-h-[104px] w-full object-cover"
                : "max-h-[220px] w-full object-cover"
            }
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
            <div
              className={`inline-flex items-center gap-1 rounded-full bg-white/92 font-medium text-slate-700 shadow-sm ${
                compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs"
              }`}
            >
              <ImageIcon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              Xem
            </div>

            <div
              className={`inline-flex items-center gap-1 rounded-full bg-white/92 font-medium text-slate-700 shadow-sm ${
                compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs"
              }`}
            >
              <LoaderCircle className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} animate-spin`} />
              Tải lên
            </div>
          </div>
        </button>
      ) : (
        <div
          className={`flex items-center justify-center bg-slate-50 text-slate-500 ${
            compact ? "h-[96px]" : "h-[180px]"
          }`}
        >
          <div
            className={`inline-flex items-center gap-1.5 rounded-full bg-white font-medium shadow-sm ${
              compact ? "px-2 py-1 text-[10px]" : "px-3 py-2 text-xs"
            }`}
          >
            <LoaderCircle className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} animate-spin`} />
            Đang chuẩn bị ảnh
          </div>
        </div>
      )}
    </div>
  );
}

function FileCard({ attachment, compact = false }) {
  const resolvedUrl = chatAPI.getAttachmentUrl(attachment);
  const fileName = pickFilename(attachment);

  if (!resolvedUrl) return null;

  return (
    <a
      href={resolvedUrl}
      target="_blank"
      rel="noreferrer"
      className={`block border border-slate-200 bg-white text-left shadow-sm transition hover:bg-slate-50 ${
        compact ? "rounded-[20px] px-3 py-2.5" : "rounded-3xl px-4 py-3"
      }`}
      aria-label={`Tải tệp ${fileName || ""}`}
      title={fileName || "Tải tệp"}
    >
      <div className={`flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
        <div
          className={`shrink-0 rounded-full bg-slate-100 text-slate-700 ${
            compact
              ? "flex h-8 w-8 items-center justify-center"
              : "flex h-10 w-10 items-center justify-center"
          }`}
        >
          <FileText className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`line-clamp-2 font-semibold text-slate-800 ${
              compact ? "text-[12px] leading-4" : "text-sm leading-5"
            }`}
          >
            {fileName}
          </div>
          <div className={`mt-0.5 text-slate-500 ${compact ? "text-[10px]" : "text-xs"}`}>
            {getCompactFileMeta(attachment)}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function MessageAttachments({
  attachments = [],
  onPreviewImage,
  compact = false,
}) {
  if (!Array.isArray(attachments) || !attachments.length) return null;

  const imageClass = compact
    ? "max-h-[104px] w-full object-cover"
    : "max-h-[220px] w-full object-cover";

  return (
    <div className={compact ? "mt-1.5 space-y-1.5" : "mt-2 space-y-2"}>
      {attachments.map((attachment, index) => {
        const resolvedUrl = chatAPI.getAttachmentUrl(attachment);
        const key = `${resolvedUrl || attachment?.filename || "att"}-${index}`;
        const isImage = isImageAttachment(attachment);
        const fileName = pickFilename(attachment);
        const isUploading =
          attachment?.uploadState === "uploading" || attachment?.__localFile;

        if (isUploading) {
          return isImage ? (
            <LoadingImageCard
              key={key}
              attachment={attachment}
              onPreviewImage={onPreviewImage}
              compact={compact}
            />
          ) : (
            <LoadingFileCard
              key={key}
              attachment={attachment}
              compact={compact}
            />
          );
        }

        if (isImage) {
          if (!resolvedUrl) {
            return (
              <div
                key={key}
                className={`border border-slate-200 bg-white text-slate-500 shadow-sm ${
                  compact
                    ? "rounded-[20px] px-2.5 py-2 text-[12px]"
                    : "rounded-3xl px-3 py-3 text-sm"
                }`}
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
              className={`block w-full overflow-hidden border border-amber-200 bg-white text-left shadow-sm transition hover:scale-[1.01] ${
                compact ? "rounded-[20px]" : "rounded-3xl"
              }`}
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
          <FileCard
            key={key}
            attachment={attachment}
            compact={compact}
          />
        );
      })}
    </div>
  );
}