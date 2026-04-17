import { Edit2, ImageIcon } from "lucide-react";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f3f4f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e5e7eb;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='600' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='32' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3ENo Cover Image%3C/text%3E%3C/svg%3E";

const getProjectCoverUrl = (project) => {
  if (project?.coverMedia?.url) return project.coverMedia.url;
  if (Array.isArray(project?.coverMedia) && project.coverMedia[0]?.url) {
    return project.coverMedia[0].url;
  }
  return PLACEHOLDER_IMAGE;
};

export function ProjectCover({ project, isOrganizer }) {
  const coverUrl = getProjectCoverUrl(project);

  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="relative aspect-[16/8.2] overflow-hidden bg-slate-100">
        <img
          alt={project?.title || "Project Cover"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          src={coverUrl}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.28),rgba(15,23,42,0.02)_35%,transparent)]" />

        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
          <ImageIcon size={14} />
          Project Visual
        </div>

        {isOrganizer ? (
          <button className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25">
            <Edit2 className="h-4 w-4" />
            Edit Media
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default ProjectCover;