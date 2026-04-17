import { FileText } from "lucide-react";
import {
  getPreviewCoverMedia,
  getPreviewDocuments,
} from "./utils/step3Preview.utils";

const isVideoFile = (file) => {
  const mime = String(file?.mimetype || file?.type || "");
  const mediaType = String(file?.mediaType || "");
  const url = String(file?.url || "");

  return (
    mime.startsWith("video/") ||
    mediaType === "video" ||
    /\.(mp4|mov|webm)$/i.test(url)
  );
};

export function PreviewUploadedMedia({ formData }) {
  const coverMedia = getPreviewCoverMedia(formData);
  const documents = getPreviewDocuments(formData);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Project Cover</h3>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {coverMedia ? (
            isVideoFile(coverMedia) ? (
              <video
                className="max-h-[420px] w-full object-cover"
                src={coverMedia.url}
                controls
              />
            ) : (
              <img
                src={coverMedia.url}
                alt="Project cover"
                className="max-h-[420px] w-full object-cover"
              />
            )
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-sm font-medium text-slate-400">
              Chưa có cover media
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Documents</h3>

        {documents.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Chưa có tài liệu đính kèm
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {documents.map((doc, index) => (
              <a
                key={doc?._id || doc?.publicId || doc?.url || index}
                href={doc?.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
              >
                <div className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">
                  <FileText size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {doc?.originalName || `Document ${index + 1}`}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {doc?.mimetype || "Attached file"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewUploadedMedia;