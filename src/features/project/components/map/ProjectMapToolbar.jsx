import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Compass,
  Layers,
  List,
  LocateFixed,
  Search,
  Users,
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
  { value: "ALL", label: "Tất cả nhà tổ chức" },
  { value: "FOLLOWED", label: "Đã theo dõi" },
];

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      onClose?.();
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ref, onClose]);
}

function CustomSelect({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder,
  className = "",
}) {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(rootRef, () => setIsOpen(false));

  const selectedOption =
    options.find((option) => option.value === value) ||
    options[0] ||
    { label: placeholder || "" };

  const handleSelect = (nextValue) => {
    onChange?.({
      target: { value: nextValue },
    });
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-11 w-full min-w-0 items-center gap-2 rounded-2xl border px-3 text-left shadow-sm outline-none transition-all ${
          isOpen
            ? "border-amber-400 bg-white ring-2 ring-amber-400/20"
            : "border-amber-100 bg-white/95 hover:border-amber-200"
        }`}
      >
        <Icon size={15} className="shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
          {selectedOption.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[5000] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const isActive = option.value === value;

              return (
                <button
                  key={option.value || "empty"}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-amber-50 text-amber-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isActive
                        ? "border-amber-300 bg-amber-100 text-amber-700"
                        : "border-slate-200 bg-white text-transparent"
                    }`}
                  >
                    <Check size={12} />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToolbarButton({ onClick, icon: Icon, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      <Icon size={15} className="shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}

function ProjectMapToolbarComponent({
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
    <div className="pointer-events-auto rounded-[24px] border border-white/70 bg-white/84 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="hidden xl:grid xl:grid-cols-[minmax(260px,0.95fr)_225px_185px_130px_130px_135px] xl:items-center xl:gap-3">
        <div className="relative min-w-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={15} className="text-slate-400" />
          </div>

          <input
            type="text"
            value={searchValue}
            onChange={onSearchChange}
          placeholder="Tìm dự án, địa điểm, nhà tổ chức..."
            className="h-11 w-full rounded-2xl border border-amber-100 bg-white/95 py-2 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <CustomSelect
          value={filters.category}
          onChange={onCategoryChange}
          options={CATEGORY_OPTIONS}
          icon={Layers}
          placeholder="Danh mục"
        />

        <CustomSelect
          value={filters.organizerScope}
          onChange={onOrganizerScopeChange}
          options={ORGANIZER_SCOPE_OPTIONS}
          icon={Users}
          placeholder="Nhà tổ chức"
        />

        <ToolbarButton onClick={onLocateMe} icon={LocateFixed}>
          <span className={isLocating ? "animate-pulse" : ""}>Vị trí tôi</span>
        </ToolbarButton>

        <ToolbarButton onClick={onResetVietnam} icon={Compass}>
          Việt Nam
        </ToolbarButton>

        <Link
          to="/projects"
          className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] px-4 text-sm font-bold text-slate-900 transition hover:bg-[#F59E0B]"
        >
          <List size={15} className="shrink-0" />
          <span className="truncate">Danh sách</span>
        </Link>
      </div>

      <div className="hidden lg:grid xl:hidden lg:grid-cols-[minmax(220px,1fr)_190px_160px_112px] lg:gap-3">
        <div className="relative min-w-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={15} className="text-slate-400" />
          </div>

          <input
            type="text"
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Tìm dự án..."
            className="h-11 w-full rounded-2xl border border-amber-100 bg-white/95 py-2 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <CustomSelect
          value={filters.category}
          onChange={onCategoryChange}
          options={CATEGORY_OPTIONS}
          icon={Layers}
          placeholder="Danh mục"
        />

        <CustomSelect
          value={filters.organizerScope}
          onChange={onOrganizerScopeChange}
          options={ORGANIZER_SCOPE_OPTIONS}
          icon={Users}
          placeholder="Nhà tổ chức"
        />

        <Link
          to="/projects"
          className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] px-4 text-sm font-bold text-slate-900 transition hover:bg-[#F59E0B]"
        >
          <List size={15} className="shrink-0" />
          <span className="truncate">Danh sách</span>
        </Link>

        <ToolbarButton onClick={onLocateMe} icon={LocateFixed}>
          <span className={isLocating ? "animate-pulse" : ""}>Vị trí tôi</span>
        </ToolbarButton>

        <ToolbarButton onClick={onResetVietnam} icon={Compass}>
          Việt Nam
        </ToolbarButton>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        <div className="relative min-w-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={15} className="text-slate-400" />
          </div>

          <input
            type="text"
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Tìm dự án, địa điểm, nhà tổ chức..."
            className="h-11 w-full rounded-2xl border border-amber-100 bg-white/95 py-2 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CustomSelect
            value={filters.category}
            onChange={onCategoryChange}
            options={CATEGORY_OPTIONS}
            icon={Layers}
            placeholder="Danh mục"
          />

          <CustomSelect
            value={filters.organizerScope}
            onChange={onOrganizerScopeChange}
            options={ORGANIZER_SCOPE_OPTIONS}
            icon={Users}
            placeholder="Nhà tổ chức"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ToolbarButton onClick={onLocateMe} icon={LocateFixed}>
            <span className={isLocating ? "animate-pulse" : ""}>Vị trí tôi</span>
          </ToolbarButton>

          <ToolbarButton onClick={onResetVietnam} icon={Compass}>
            Việt Nam
          </ToolbarButton>

          <Link
            to="/projects"
            className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] px-4 text-sm font-bold text-slate-900 transition hover:bg-[#F59E0B]"
          >
            <List size={15} className="shrink-0" />
            <span className="truncate">Danh sách</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const ProjectMapToolbar = memo(
  ProjectMapToolbarComponent,
  (prevProps, nextProps) =>
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
