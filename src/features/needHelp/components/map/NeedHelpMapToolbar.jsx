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
  Search,
} from 'lucide-react';
import {
  CATEGORY_OPTIONS,
  URGENCY_OPTIONS,
} from '../../utils/helpRequestMap.utils';

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      onClose?.();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
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
    options[0] ||
    { label: placeholder || '' };

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
            ? 'border-amber-400 bg-white ring-2 ring-amber-400/20'
            : 'border-amber-100 bg-white/95 hover:border-amber-200'
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
        <div className="absolute right-0 top-[calc(100%+8px)] z-[5000] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
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

function ToolbarButton({ onClick, icon: Icon, children, className = '' }) {
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

function NeedHelpMapToolbarComponent({
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
    <div className="pointer-events-auto rounded-[26px] border border-white/70 bg-white/84 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="grid grid-cols-[minmax(240px,1.35fr)_180px_180px_140px_140px_132px] items-center gap-3">
        <div className="relative min-w-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={15} className="text-slate-400" />
          </div>

          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm tiêu đề, địa điểm, nội dung..."
            className="h-11 w-full rounded-2xl border border-amber-100 bg-white/95 py-2 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
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
          value={filters.urgencyLevel}
          onChange={onUrgencyChange}
          options={URGENCY_OPTIONS}
          icon={AlertTriangle}
          placeholder="Mức độ"
        />

        <ToolbarButton onClick={onLocateMe} icon={LocateFixed}>
          <span className={isLocating ? 'animate-pulse' : ''}>Vị trí tôi</span>
        </ToolbarButton>

        <ToolbarButton onClick={onResetVietnam} icon={Compass}>
          Việt Nam
        </ToolbarButton>

        <div className="flex min-w-0 items-center justify-end gap-2">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              title="Đặt lại bộ lọc"
            >
              <FilterX size={16} />
            </button>
          ) : null}

          <Link
            to="/need-help"
            className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] px-4 text-sm font-bold text-slate-900 transition hover:bg-amber-500"
          >
            <List size={15} className="shrink-0" />
            <span className="truncate">Danh sách</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(NeedHelpMapToolbarComponent);