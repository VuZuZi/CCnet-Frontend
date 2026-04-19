import { memo, useEffect, useMemo, useRef, useState } from 'react';
import NeedHelpMapCard from './NeedHelpMapCard';

const ITEM_HEIGHT = 236;
const OVERSCAN = 3;

function NeedHelpMapSidebarComponent({
  visibleItems,
  activeItemId,
  onItemSelect,
  isLoading,
}) {
  const scrollRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(400);
  const [scrollTop, setScrollTop] = useState(0);

  const items = useMemo(
    () => (Array.isArray(visibleItems) ? visibleItems : []),
    [visibleItems]
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const updateHeight = () => {
      setViewportHeight(Math.max(220, Math.floor(element.clientHeight)));
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

  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const offsetY = startIndex * ITEM_HEIGHT;

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-[32px] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <h2 className="text-sm font-bold text-slate-900">
          Yêu cầu trong vùng đang xem
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Chọn một mục để định vị nhanh trên bản đồ
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-0 pb-3 pt-3">
        {isLoading ? (
          <div className="space-y-3 px-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-[24px] bg-slate-100"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4">
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                Không có yêu cầu nào trong vùng bản đồ hiện tại.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Hãy kéo bản đồ sang khu vực khác hoặc giảm bộ lọc.
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
                {virtualItems.map((item) => (
                  <NeedHelpMapCard
                    key={item.id}
                    item={item}
                    isActive={activeItemId === item.id}
                    onClick={onItemSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

const NeedHelpMapSidebar = memo(
  NeedHelpMapSidebarComponent,
  (prevProps, nextProps) =>
    prevProps.visibleItems === nextProps.visibleItems &&
    prevProps.activeItemId === nextProps.activeItemId &&
    prevProps.onItemSelect === nextProps.onItemSelect &&
    prevProps.isLoading === nextProps.isLoading
);

export default NeedHelpMapSidebar;