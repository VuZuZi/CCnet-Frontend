import { ExternalLink, FileText } from "lucide-react";
import {
  isImageLike,
  isPdfLike,
} from "../../utils/adminProjectDisplay.utils";

export default function ProjectDocumentsList({ documents = [] }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-base font-black text-slate-900">
        Verification Documents
      </h4>

      {documents.length ? (
        <div className="space-y-3">
          {documents.map((doc, idx) => {
            const url = doc?.url;
            const name =
              doc?.originalName ||
              doc?.name ||
              doc?.publicId ||
              `document-${idx + 1}`;
            const mimetype = doc?.mimetype || doc?.mimeType || "";
            const image = isImageLike(url, mimetype);
            const pdf = isPdfLike(url, mimetype, name);

            return (
              <a
                key={`${doc?._id || doc?.publicId || idx}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-amber-200 hover:bg-amber-50/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {image ? (
                    <img
                      src={url}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText
                      className={pdf ? "text-red-500" : "text-slate-500"}
                      size={16}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {mimetype || (pdf ? "application/pdf" : "file")}
                  </p>
                </div>

                <ExternalLink
                  size={14}
                  className="shrink-0 text-slate-300"
                />
              </a>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
          No documents
        </div>
      )}
    </div>
  );
}