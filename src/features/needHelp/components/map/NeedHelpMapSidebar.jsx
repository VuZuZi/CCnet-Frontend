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
  mode = 'cluster',
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

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setScrollTop(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
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

  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const offsetY = startIndex * NEED_HELP_SIDEBAR_ITEM_HEIGHT;

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-[32px] border border-slate-200/80 bg-white/96 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Yêu cầu trong vùng đang xem
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {summaryText || 'Chọn một mục để định vị nhanh trên bản đồ'}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              mode === 'cluster'
                ? 'bg-slate-900 text-white'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {mode === 'cluster' ? 'Đang gom cụm' : 'Đang hiện từng mục'}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-0 pb-3 pt-3">
        {isLoading ? (
          <div className="space-y-3 px-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[220px] animate-pulse rounded-[28px] bg-slate-100"
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
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.summaryText === nextProps.summaryText &&
    prevProps.mode === nextProps.mode
);

export default NeedHelpMapSidebar;