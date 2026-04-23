import { useEffect, useState } from 'react';
import {
  ExternalLink,
  FileText,
  PlayCircle,
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

function EvidenceImagePreview({ imageUrl, onClose }) {
  useEffect(() => {
    if (!imageUrl) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước ảnh minh chứng"
    >
      <img
        src={imageUrl}
        alt="Xem trước minh chứng"
        onClick={(event) => event.stopPropagation()}
        className="h-[86vh] w-auto max-w-[92vw] object-contain shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      />
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
          label="Minh chứng & tệp đính kèm"
          description="Tệp minh chứng đính kèm theo yêu cầu để quản trị viên kiểm duyệt."
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
                  alt={evidence.originalName || `Minh chứng ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/35" />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/70 to-transparent px-3 py-3">
                  <span className="line-clamp-1 text-xs font-medium text-white">
                    {evidence.originalName || `Ảnh ${index + 1}`}
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
                    {video.originalName || `Video minh chứng ${index + 1}`}
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
                    {document.originalName || `Tài liệu ${index + 1}`}
                  </span>
                </span>
                <ExternalLink size={15} className="shrink-0 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </section>

      <EvidenceImagePreview
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}

export default EvidenceGallery; 
