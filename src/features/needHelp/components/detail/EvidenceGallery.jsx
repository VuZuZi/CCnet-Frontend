import { useState } from 'react';
import { ExternalLink, FileText, PlayCircle, X, ZoomIn } from 'lucide-react';

export function EvidenceGallery({ evidences = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!evidences.length) {
    return null;
  }

  const images = evidences.filter((item) => item?.mediaType === 'image' || !item?.mediaType);
  const videos = evidences.filter((item) => item?.mediaType === 'video');
  const documents = evidences.filter((item) => item?.mediaType === 'document');

  return (
    <>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Evidence & Media
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Supporting files attached to the request for review and verification.
          </p>
        </div>

        {!!images.length && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {images.map((evidence, index) => (
              <button
                key={`${evidence.url}-${index}`}
                type="button"
                onClick={() => setSelectedImage(evidence.url)}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left"
              >
                <img
                  src={evidence.url}
                  alt={evidence.originalName || `Evidence ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/0 opacity-0 transition-all duration-300 group-hover:bg-slate-950/45 group-hover:opacity-100">
                  <ZoomIn className="mb-2 text-white" size={20} />
                  <span className="px-3 text-center text-xs font-medium text-white">
                    {evidence.originalName || 'Preview image'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {!!videos.length && (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <a
                key={`${video.url}-${index}`}
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
              >
                <span className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <PlayCircle size={18} className="text-sky-600" />
                  {video.originalName || `Video evidence ${index + 1}`}
                </span>
                <ExternalLink size={16} className="text-slate-400" />
              </a>
            ))}
          </div>
        )}

        {!!documents.length && (
          <div className="space-y-3">
            {documents.map((document, index) => (
              <a
                key={`${document.url}-${index}`}
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <FileText size={18} className="text-amber-600" />
                  {document.originalName || `Document ${index + 1}`}
                </span>
                <ExternalLink size={16} className="text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X size={24} />
          </button>

          <img
            src={selectedImage}
            alt="Evidence preview"
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
