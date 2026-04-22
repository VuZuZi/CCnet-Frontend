import { memo, useMemo } from 'react';
import { MapPinned } from 'lucide-react';
import NeedHelpMapCard from './NeedHelpMapCard';

function NeedHelpMapSidebarComponent({
  visibleItems,
  activeItemId,
  onItemSelect,
  isLoading,
  summaryText = '',
  isOpen = true,
}) {
  const items = useMemo(
    () => (Array.isArray(visibleItems) ? visibleItems : []),
    [visibleItems]
  );

  if (!isOpen) return null;

  return (
    <aside className="pointer-events-auto absolute left-5 top-[128px] bottom-5 z-[2200] flex w-[360px] min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <MapPinned size={18} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900">
              Yêu cầu trong vùng đang xem
            </h2>
            <p className="mt-1 truncate text-xs text-slate-500">
              {summaryText || 'Chọn một mục để định vị nhanh trên bản đồ'}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-3">
        {isLoading ? (
          <div className="space-y-3 px-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
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
                Hãy kéo bản đồ hoặc giảm bộ lọc.
              </p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <NeedHelpMapCard
              key={item.id}
              item={item}
              isActive={activeItemId === item.id}
              onClick={onItemSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default memo(NeedHelpMapSidebarComponent);