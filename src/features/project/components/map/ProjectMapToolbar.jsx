import { memo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  LocateFixed,
  List,
  Search,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả danh mục" },
  { value: "Y_TE", label: "Y tế & Sức khỏe" },
  { value: "GIAO_DUC", label: "Giáo dục" },
  { value: "MOI_TRUONG", label: "Môi trường" },
  { value: "THIEN_TAI", label: "Cứu trợ khẩn cấp" },
  { value: "XAY_DUNG", label: "Xây dựng" },
  { value: "KHAC", label: "Khác" },
];

const ORGANIZER_SCOPE_OPTIONS = [
  { value: "ALL", label: "Tất cả organizer" },
  { value: "FOLLOWED", label: "Organizer đã follow" },
];

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      onClose?.();
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ref, onClose]);
}

function CustomSelect({ value, onChange, options }) {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(rootRef, () => setIsOpen(false));

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  const handleSelect = (nextValue) => {
    onChange?.({
      target: {
        value: nextValue,
      },
    });
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative z-[2600] min-w-0 overflow-visible">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-10 w-full items-center justify-between rounded-2xl border px-4 text-sm font-semibold shadow-sm outline-none transition-all ${
          isOpen
            ? "border-amber-400 bg-amber-50 ring-4 ring-amber-100"
            : "border-slate-200 bg-white hover:border-amber-300"
        }`}
      >
        <span className="truncate text-slate-700">{selectedOption?.label}</span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[3000] overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const isActive = option.value === value;

              return (
                <button
                  key={option.value || "empty"}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-amber-100 text-slate-900"
                      : "text-slate-700 hover:bg-amber-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProjectMapToolbarComponent({
  summaryText,
  searchValue,
  onSearchChange,
  filters,
  onCategoryChange,
  onOrganizerScopeChange,
  onLocateMe,
  onResetVietnam,
  isLocating = false,
}) {
  return (
    <div className="relative z-[2500] pointer-events-auto overflow-visible rounded-[26px] border border-amber-100 bg-white/95 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 overflow-visible">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                <Sparkles size={18} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[20px] font-black tracking-tight text-slate-900 sm:text-[22px]">
                  Bản đồ dự án cộng đồng
                </h2>
                <p className="truncate text-sm font-medium text-slate-500">
                  {summaryText}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onLocateMe}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900"
            >
              <LocateFixed
                size={15}
                className={isLocating ? "animate-pulse" : ""}
              />
              Vị trí của tôi
            </button>

            <button
              type="button"
              onClick={onResetVietnam}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900"
            >
              <Compass size={15} />
              Toàn Việt Nam
            </button>

            <Link
              to="/projects"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#FBBF24] px-5 text-sm font-black text-slate-900 transition-all hover:bg-[#F59E0B]"
            >
              <List size={15} />
              Danh sách
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 overflow-visible xl:grid-cols-[minmax(0,1.35fr)_210px_210px]">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              type="text"
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Tìm theo tên dự án, địa điểm, organizer..."
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <CustomSelect
            value={filters.category}
            onChange={onCategoryChange}
            options={CATEGORY_OPTIONS}
          />

          <CustomSelect
            value={filters.organizerScope}
            onChange={onOrganizerScopeChange}
            options={ORGANIZER_SCOPE_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}

const ProjectMapToolbar = memo(
  ProjectMapToolbarComponent,
  (prevProps, nextProps) =>
    prevProps.summaryText === nextProps.summaryText &&
    prevProps.searchValue === nextProps.searchValue &&
    prevProps.filters === nextProps.filters &&
    prevProps.onSearchChange === nextProps.onSearchChange &&
    prevProps.onCategoryChange === nextProps.onCategoryChange &&
    prevProps.onOrganizerScopeChange === nextProps.onOrganizerScopeChange &&
    prevProps.onLocateMe === nextProps.onLocateMe &&
    prevProps.onResetVietnam === nextProps.onResetVietnam &&
    prevProps.isLocating === nextProps.isLocating
);

export default ProjectMapToolbar;