import { useState } from 'react';
import {
  ExternalLink,
  FileText,
  PlayCircle,
  X,
  ZoomIn,
  Images,
} from 'lucide-react';

function SectionLabel({ icon: Icon, label, description }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        <Icon size={13} />
        {label}
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

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
        <SectionLabel
          icon={Images}
          label="Evidence & Media"
          description="Supporting files attached to this request for admin review."
        />

        {!!images.length && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {images.map((evidence, index) => (
              <button
                key={`${evidence.url}-${index}`}
                type="button"
                onClick={() => setSelectedImage(evidence.url)}
                className="group relative aspect-[1/1] overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <img
                  src={evidence.url}
                  alt={evidence.originalName || `Evidence ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/35" />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/70 to-transparent px-3 py-3">
                  <span className="line-clamp-1 text-xs font-medium text-white">
                    {evidence.originalName || `Image ${index + 1}`}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                    <ZoomIn size={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {!!videos.length && (
          <div className="space-y-2">
            {videos.map((video, index) => (
              <a
                key={`${video.url}-${index}`}
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors hover:bg-slate-100"
              >
                <span className="inline-flex min-w-0 items-center gap-3 text-slate-700">
                  <PlayCircle size={17} className="shrink-0 text-sky-600" />
                  <span className="truncate font-medium">
                    {video.originalName || `Video evidence ${index + 1}`}
                  </span>
                </span>
                <ExternalLink size={15} className="shrink-0 text-slate-400" />
              </a>
            ))}
          </div>
        )}

        {!!documents.length && (
          <div className="space-y-2">
            {documents.map((document, index) => (
              <a
                key={`${document.url}-${index}`}
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="inline-flex min-w-0 items-center gap-3 text-slate-700">
                  <FileText size={17} className="shrink-0 text-amber-600" />
                  <span className="truncate font-medium">
                    {document.originalName || `Document ${index + 1}`}
                  </span>
                </span>
                <ExternalLink size={15} className="shrink-0 text-slate-400" />
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
            <X size={22} />
          </button>

          <img
            src={selectedImage}
            alt="Evidence preview"
            className="max-h-[88vh] max-w-full rounded-[20px] object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default EvidenceGallery;