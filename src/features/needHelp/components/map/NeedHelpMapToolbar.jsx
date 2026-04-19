import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Compass,
  FilterX,
  Layers,
  List,
  LocateFixed,
  MapPinned,
  Search,
} from 'lucide-react';
import {
  CATEGORY_OPTIONS,
  URGENCY_OPTIONS,
} from '../../hooks/useHelpRequestFilters';

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      onClose?.();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [ref, onClose]);
}

function CustomSelect({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder,
  className = '',
}) {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(rootRef, () => setIsOpen(false));

  const selectedOption =
    options.find((option) => option.value === value) ||
    options[0] || { label: placeholder || '' };

  const handleSelect = (nextValue) => {
    onChange?.({
      target: {
        value: nextValue,
      },
    });
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-10 w-full items-center gap-3 rounded-2xl border px-3 text-left shadow-sm outline-none transition-all ${
          isOpen
            ? 'border-amber-400 bg-white ring-2 ring-amber-400/20'
            : 'border-amber-100 bg-white/90 hover:border-amber-200'
        }`}
      >
        <Icon size={15} className="shrink-0 text-slate-400" />

        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
          {selectedOption.label || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[3000] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const isActive = option.value === value;

              return (
                <button
                  key={option.value || 'empty'}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isActive
                        ? 'border-amber-300 bg-amber-100 text-amber-700'
                        : 'border-slate-200 bg-white text-transparent'
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

function NeedHelpMapToolbarComponent({
  summaryText,
  localSearch,
  setLocalSearch,
  filters,
  onCategoryChange,
  onUrgencyChange,
  onResetFilters,
  hasActiveFilters,
  onLocateMe,
  onResetVietnam,
  isLocating = false,
}) {
  return (
    <div className="relative z-[2500] pointer-events-auto overflow-visible rounded-[26px] border border-amber-100/80 bg-white/88 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 overflow-visible">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <MapPinned size={20} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-bold text-slate-900">
                  Bản đồ NeedHelp
                </h2>
                <p className="truncate text-sm text-slate-500">{summaryText}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onLocateMe}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LocateFixed size={15} className={isLocating ? 'animate-pulse' : ''} />
              Vị trí của tôi
            </button>

            <button
              type="button"
              onClick={onResetVietnam}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Compass size={15} />
              Toàn Việt Nam
            </button>

            <Link
              to="/need-help"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#FBBF24] px-5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-500"
            >
              <List size={15} />
              Danh sách
            </Link>
          </div>
        </div>

        <div className="grid overflow-visible gap-2 xl:grid-cols-[minmax(0,1.8fr)_210px_210px_auto]">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={15} className="text-slate-400" />
            </div>

            <input
              type="text"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              placeholder="Tìm tiêu đề, địa điểm..."
              className="h-10 w-full rounded-2xl border border-amber-100 bg-white/90 py-2 pl-9 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <CustomSelect
            value={filters.category}
            onChange={onCategoryChange}
            options={CATEGORY_OPTIONS}
            icon={Layers}
            placeholder="Tất cả danh mục"
          />

          <CustomSelect
            value={filters.urgencyLevel}
            onChange={onUrgencyChange}
            options={URGENCY_OPTIONS}
            icon={AlertTriangle}
            placeholder="Tất cả mức độ khẩn cấp"
          />

          <div className="flex items-center justify-end">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 xl:w-auto"
              >
                <FilterX size={15} />
                Đặt lại
              </button>
            ) : (
              <div className="hidden xl:block" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const NeedHelpMapToolbar = memo(
  NeedHelpMapToolbarComponent,
  (prevProps, nextProps) =>
    prevProps.summaryText === nextProps.summaryText &&
    prevProps.localSearch === nextProps.localSearch &&
    prevProps.filters === nextProps.filters &&
    prevProps.onCategoryChange === nextProps.onCategoryChange &&
    prevProps.onUrgencyChange === nextProps.onUrgencyChange &&
    prevProps.onResetFilters === nextProps.onResetFilters &&
    prevProps.hasActiveFilters === nextProps.hasActiveFilters &&
    prevProps.onLocateMe === nextProps.onLocateMe &&
    prevProps.onResetVietnam === nextProps.onResetVietnam &&
    prevProps.isLocating === nextProps.isLocating
);

export default NeedHelpMapToolbar;