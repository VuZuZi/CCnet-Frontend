import { useEffect, useState } from "react";
import { FileText, CheckCircle, Trash2, XCircle } from "lucide-react";
import { useHybridUploader } from "@/shared/hooks/useHybridUploader";
import { mediaAPI } from "@/shared/api/media.api";
import { useToast } from "@/shared/contexts/ToastContext";

export function OrganizerDocumentField({
  label,
  description,
  value,
  accept = "image/*,.pdf",
  onSelect,
  error,
  folderContext = "organizer_kyc",
}) {
  const [preview, setPreview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { upload, cancel, isUploading, progress } = useHybridUploader();
  const toast = useToast();

  useEffect(() => {
    if (value?.url) {
      setPreview(value.url);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      const result = await upload(file, folderContext);
      if (result) {
        onSelect?.(result);
      }
    } catch (err) {
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = value?.id || value?._id;

    if (!targetId) {
      onSelect?.(null);
      return;
    }

    try {
      setIsDeleting(true);
      await mediaAPI.deleteMedia(targetId);
      onSelect?.(null);
    } catch (err) {
      toast.error("Failed to delete file from server, removing locally.");
      onSelect?.(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    cancel();
  };

  const fileName = value?.fileName || value?.originalName;
  const isImage = preview?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

  return (
    <div className="relative">
      <label
        className={`relative block cursor-pointer overflow-hidden rounded-[22px] border-2 border-dashed transition-all ${
          error
            ? "border-rose-400 bg-rose-50"
            : "border-slate-300 bg-white hover:bg-slate-50"
        } ${isUploading ? "pointer-events-none" : ""}`}
      >
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-5">
            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mb-3 text-xs font-bold text-slate-700">
              Uploading {progress}%
            </p>
            <button
              type="button"
              onClick={handleCancel}
              className="pointer-events-auto inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 transition hover:text-rose-600"
            >
              <XCircle size={14} /> Cancel
            </button>
          </div>
        )}

        {preview && !isUploading && (
          <div className="absolute inset-0 z-0 bg-black/5">
            {isImage && (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover opacity-20"
              />
            )}
          </div>
        )}

        <div className="relative z-10 px-4 py-7 text-center">
          <div
            className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
              fileName
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {fileName ? <CheckCircle size={18} /> : <FileText size={18} />}
          </div>

          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <div className="mt-1 text-xs text-slate-500">{description}</div>

          {fileName && !isUploading && (
            <p className="mt-3 truncate px-2 text-xs font-medium text-emerald-700">
              {fileName}
            </p>
          )}
        </div>

        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={isUploading || isDeleting}
          onChange={handleFileChange}
        />
      </label>

      {value && !isUploading && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute -right-3 -top-3 z-30 rounded-full border border-slate-200 bg-white p-2 text-rose-500 shadow-sm transition hover:scale-105 hover:bg-rose-50 disabled:opacity-50"
          title="Remove document"
        >
          <Trash2 size={16} className={isDeleting ? "animate-pulse" : ""} />
        </button>
      )}

      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export default OrganizerDocumentField;