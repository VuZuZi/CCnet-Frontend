import { ExternalLink, Eye, FileText, Image as ImageIcon } from "lucide-react";
import {
  isImageLike,
  isPdfLike,
} from "../../utils/adminProjectDisplay.utils";

export default function ProjectDocumentsList({
  documents = [],
  onPreviewDocument,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-base font-black text-slate-900">
        Tài liệu Xác minh
      </h4>

      {documents.length ? (
        <div className="space-y-3">
          {documents.map((doc, idx) => {
            const url = doc?.url || "";
            const name =
              doc?.originalName ||
              doc?.name ||
              doc?.publicId ||
              `tai-lieu-${idx + 1}`;
            const mimetype = doc?.mimetype || doc?.mimeType || "";
            const image = isImageLike(url, mimetype);
            const pdf = isPdfLike(url, mimetype, name);
            const canPreview = Boolean(url);

            return (
              <div
                key={`${doc?._id || doc?.publicId || idx}`}
                className="rounded-[22px] border border-slate-200 bg-white p-4 transition hover:border-amber-200 hover:bg-amber-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {image ? (
                      <img
                        src={url}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : pdf ? (
                      <FileText size={18} className="text-red-500" />
                    ) : canPreview ? (
                      <ImageIcon size={18} className="text-slate-500" />
                    ) : (
                      <FileText size={18} className="text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900">
                      {name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {mimetype || (canPreview ? "Tài liệu" : "Chưa có liên kết")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!canPreview}
                    onClick={() => {
                      if (!canPreview) return;
                      onPreviewDocument?.(doc);
                    }}
                    className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-bold transition ${
                      canPreview
                        ? "bg-amber-400 text-slate-900 hover:brightness-105"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Eye size={14} />
                    Xem preview
                  </button>

                  {canPreview ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50"
                    >
                      <ExternalLink size={14} />
                      Mở tab mới
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
          Không có tài liệu
        </div>
      )}
    </div>
  );
}