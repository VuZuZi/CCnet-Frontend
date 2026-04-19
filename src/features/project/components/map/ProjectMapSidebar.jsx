import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Layers3 } from "lucide-react";

import ProjectMapProjectCard from "./ProjectMapProjectCard";

const ITEM_HEIGHT = 272;
const OVERSCAN = 3;

function ProjectMapSidebarComponent({
  panelProjects,
  activeProjectId,
  onProjectSelect,
  isLoading,
  isFetching,
}) {
  const scrollRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(420);
  const [scrollTop, setScrollTop] = useState(0);

  const items = useMemo(
    () => (Array.isArray(panelProjects) ? panelProjects : []),
    [panelProjects]
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateHeight = () => {
      setViewportHeight(Math.max(240, Math.floor(element.clientHeight)));
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const totalHeight = items.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const virtualItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const offsetY = startIndex * ITEM_HEIGHT;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-4 pb-2.5 pt-3">
          <div className="flex items-center gap-2">
            <Layers3 size={16} className="text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Dự án trong vùng đang xem
            </h2>
          </div>

          {isFetching ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              Đang cập nhật...
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-0 pb-3 pt-3">
          {isLoading ? (
            <div className="space-y-3 px-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-3xl bg-slate-100"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-3">
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-500">
                  Không có dự án nào phù hợp trong vùng bản đồ hiện tại.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Hãy thử thay đổi từ khóa tìm kiếm, bộ lọc hoặc kéo bản đồ sang khu vực khác.
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto px-0"
              onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
            >
              <div
                className="relative w-full"
                style={{ height: `${totalHeight}px` }}
              >
                <div
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${offsetY}px)` }}
                >
                  {virtualItems.map((project) => (
                    <ProjectMapProjectCard
                      key={project.projectId}
                      project={project}
                      isActive={activeProjectId === project.projectId}
                      onClick={onProjectSelect}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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
    prevProps.isFetching === nextProps.isFetching
);

export default ProjectMapSidebar;