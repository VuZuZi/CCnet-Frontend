import { Edit2, ImageIcon } from 'lucide-react';

export function ProjectCover({ project, isOrganizer }) {
  const coverUrl =
    project?.coverMedia?.url ||
    'https://via.placeholder.com/1200x600?text=No+Cover+Image';

  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="relative aspect-[16/8.2] overflow-hidden bg-slate-100">
        <img
          alt={project?.title || 'Project Cover'}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          src={coverUrl}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.28),rgba(15,23,42,0.02)_35%,transparent)]" />

        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
          <ImageIcon size={14} />
          Project Visual
        </div>

        {isOrganizer && (
          <button className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25">
            <Edit2 className="h-4 w-4" />
            Edit Media
          </button>
        )}
      </div>
    </div>
  );
}

export default ProjectCover;