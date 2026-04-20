import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Search,
  Loader2,
  ChevronDown,
  Map,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả danh mục" },
  { value: "Y_TE", label: "Y tế & Sức khỏe" },
  { value: "GIAO_DUC", label: "Giáo dục" },
  { value: "MOI_TRUONG", label: "Môi trường" },
  { value: "THIEN_TAI", label: "Cứu trợ khẩn cấp" },
  { value: "XAY_DUNG", label: "Xây dựng" },
];

const ORGANIZER_SCOPE_OPTIONS = [
  { value: "ALL", label: "Tất cả organizer" },
  { value: "FOLLOWED", label: "Organizer đã follow" },
];

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative w-full sm:min-w-[220px] xl:w-[220px]">
      <select
        value={value}
        onChange={onChange}
        className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />
    </div>
  );
}

export default function ProjectFilterBar({
  localLocation,
  setLocalLocation,
  filters,
  onCategoryChange,
  onOrganizerScopeChange,
  onApplyLocation,
  isFetching,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onApplyLocation?.();
    }
  };

  return (
    <div className="sticky top-20 z-40 mb-6 flex flex-col gap-4 border-b border-slate-200 bg-slate-50/95 py-4 backdrop-blur-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <LayoutGrid className="text-amber-500" size={24} />
          Khám phá tất cả dự án
        </h2>

        <Link
          to="/projects/map"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] px-5 text-sm font-black text-slate-900 shadow-sm transition-all hover:bg-[#F59E0B]"
        >
          <Map size={18} />
          Xem bản đồ
        </Link>
      </div>

      <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
              onChange={(event) => setLocalLocation(event.target.value)}
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
          <FilterSelect
            value={filters.category}
            onChange={onCategoryChange}
            options={CATEGORY_OPTIONS}
          />

          <FilterSelect
            value={filters.organizerScope}
            onChange={onOrganizerScopeChange}
            options={ORGANIZER_SCOPE_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}