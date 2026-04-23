import { memo, useMemo } from "react";
import { Layers3 } from "lucide-react";

import ProjectMapProjectCard from "./ProjectMapProjectCard";

function ProjectMapSidebarComponent({
  panelProjects,
  activeProjectId,
  onProjectSelect,
  isLoading,
  summaryText = "",
  isOpen = true,
}) {
  const items = useMemo(
    () => (Array.isArray(panelProjects) ? panelProjects : []),
    [panelProjects]
  );

  if (!isOpen) return null;

  return (
    <aside className="pointer-events-auto absolute bottom-5 left-5 top-[92px] z-[2200] flex min-h-0 w-[min(360px,calc(100vw-40px))] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <div className="flex items-center border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Layers3 size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900">
                Dự án trong vùng đang xem
              </h2>
              <p className="mt-1 truncate text-xs text-slate-500">
                {summaryText || "Chọn một dự án để định vị nhanh trên bản đồ"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-3">
        {isLoading ? (
          <div className="space-y-3 px-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[248px] animate-pulse rounded-[28px] bg-slate-100"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4">
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                Không có dự án nào phù hợp trong vùng bản đồ hiện tại.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Hãy thử thay đổi từ khóa, bộ lọc hoặc kéo bản đồ sang khu vực
                khác.
              </p>
            </div>
          </div>
        ) : (
          items.map((project) => (
            <ProjectMapProjectCard
              key={project.projectId}
              project={project}
              isActive={activeProjectId === project.projectId}
              onClick={onProjectSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}

const ProjectMapSidebar = memo(
  ProjectMapSidebarComponent,
  (prevProps, nextProps) =>
    prevProps.panelProjects === nextProps.panelProjects &&
    prevProps.activeProjectId === nextProps.activeProjectId &&
    prevProps.onProjectSelect === nextProps.onProjectSelect &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.summaryText === nextProps.summaryText &&
    prevProps.isOpen === nextProps.isOpen
);

export default ProjectMapSidebar;
