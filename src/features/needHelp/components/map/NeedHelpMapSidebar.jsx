import { memo, useEffect, useMemo, useRef, useState } from 'react';
import NeedHelpMapCard from './NeedHelpMapCard';
import {
  NEED_HELP_SIDEBAR_ITEM_HEIGHT,
  NEED_HELP_SIDEBAR_OVERSCAN,
} from '../../utils/helpRequestMap.utils';

function NeedHelpMapSidebarComponent({
  visibleItems,
  activeItemId,
  onItemSelect,
  isLoading,
  summaryText = '',
}) {
  const scrollRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(420);
  const [scrollTop, setScrollTop] = useState(0);

  const items = useMemo(
    () => (Array.isArray(visibleItems) ? visibleItems : []),
    [visibleItems]
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const updateHeight = () => {
      setViewportHeight(Math.max(260, Math.floor(element.clientHeight)));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [items]);

  const totalHeight = items.length * NEED_HELP_SIDEBAR_ITEM_HEIGHT;

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / NEED_HELP_SIDEBAR_ITEM_HEIGHT) - NEED_HELP_SIDEBAR_OVERSCAN
  );

  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewportHeight) / NEED_HELP_SIDEBAR_ITEM_HEIGHT) +
      NEED_HELP_SIDEBAR_OVERSCAN
  );

  const virtualItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const offsetY = startIndex * NEED_HELP_SIDEBAR_ITEM_HEIGHT;

  return (
    <aside className="flex h-full flex-col rounded-[32px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <h2 className="text-sm font-bold text-slate-900">
          Yêu cầu trong vùng đang xem
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {summaryText || 'Chọn một mục để định vị nhanh trên bản đồ'}
        </p>
      </div>

      <div className="flex-1 overflow-hidden px-0 pb-3 pt-3">
        {isLoading ? (
          <div className="space-y-3 px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[220px] animate-pulse rounded-[28px] bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4">
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                Không có yêu cầu nào trong vùng bản đồ hiện tại.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Hãy kéo bản đồ hoặc giảm bộ lọc.
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto"
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            <div className="relative w-full" style={{ height: totalHeight }}>
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

export default memo(NeedHelpMapSidebarComponent);