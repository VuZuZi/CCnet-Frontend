import { Download, Eye, FileText, Image as ImageIcon } from "lucide-react";
import {
  getDocumentFileName,
  getDocumentHref,
  isImageDocument,
} from "./organizerDocument.utils";

export function OrganizerDocumentCard({
  title,
  file,
  emptyText = "No document",
  onView,
}) {
  if (!file) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate" title={title}>{title}</p>
            <p className="mt-1 text-xs text-slate-400 truncate">{emptyText}</p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <FileText size={18} />
          </div>
        </div>
      </div>
    );
  }

  const href = getDocumentHref(file);
  const fileName = getDocumentFileName(file, title);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate" title={title}>{title}</p>
          <p className="mt-1 text-xs text-slate-500 truncate" title={fileName}>
            {fileName}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {isImageDocument(file) ? (
            <ImageIcon size={18} />
          ) : (
            <FileText size={18} />
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onView?.({ title, file })}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-200"
        >
          <Eye size={14} />
          View
        </button>

        <a
          href={href}
          download={fileName}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Download size={14} />
          Download
        </a>
      </div>
    </div>
  );
}

export default OrganizerDocumentCard;