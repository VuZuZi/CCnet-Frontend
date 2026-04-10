import { LayoutGrid, Search, Loader2, ChevronDown } from "lucide-react";

export default function ProjectFilterBar({
  localLocation,
  setLocalLocation,
  filters,
  onCategoryChange,
  onOrganizerScopeChange,
  onApplyLocation,
  isFetching,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onApplyLocation?.();
    }
  };

  return (
    <div className="sticky top-20 z-40 mb-6 flex flex-col items-start justify-between gap-4 border-b border-slate-200 bg-slate-50/95 py-4 backdrop-blur-md md:flex-row md:items-center">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <LayoutGrid className="text-amber-500" size={24} />
        Khám phá tất cả dự án
      </h2>

      <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row">
        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
          <div className="relative w-full sm:min-w-[320px] xl:w-[360px]">
            {isFetching ? (
              <Loader2
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-amber-500"
                size={18}
              />
            ) : (
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
            )}

            <input
              type="text"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm theo địa điểm..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <button
            type="button"
            onClick={onApplyLocation}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-amber-400 px-5 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-amber-500"
          >
            Tìm
          </button>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
          <div className="relative w-full sm:min-w-[220px] xl:w-[220px]">
            <select
              value={filters.category}
              onChange={onCategoryChange}
              className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Tất cả danh mục</option>
              <option value="Y_TE">Y tế & Sức khỏe</option>
              <option value="GIAO_DUC">Giáo dục</option>
              <option value="MOI_TRUONG">Môi trường</option>
              <option value="THIEN_TAI">Cứu trợ khẩn cấp</option>
              <option value="XAY_DUNG">Xây dựng</option>
            </select>

            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
          </div>

          <div className="relative w-full sm:min-w-[220px] xl:w-[220px]">
            <select
              value={filters.organizerScope}
              onChange={onOrganizerScopeChange}
              className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="ALL">Tất cả organizer</option>
              <option value="FOLLOWED">Organizer đã follow</option>
            </select>

            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
          </div>
        </div>
      </div>
    </div>
  );
}