import { forwardRef, useId, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import { CalendarDays } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import 'react-datepicker/dist/react-datepicker.css';

import './CustomDatePicker.css';

registerLocale('vi', vi);

const cn = (...inputs) => twMerge(clsx(inputs));

const safeParseDate = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal;
  const parsed = new Date(dateVal);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const CustomDatePicker = forwardRef(
  (
    {
      label,
      error,
      className,
      value,
      onChange,
      minDate,
      maxDate,
      placeholder = 'dd/mm/yyyy',
      disabled,
      name,
      id,
      ...props
    },
    ref
  ) => {
    const reactId = useId();

    const safeId = useMemo(() => {
      if (id) return id;
      return `custom-date-picker-${reactId.replace(/:/g, '')}`;
    }, [id, reactId]);

    const safeName = useMemo(() => {
      if (name) return `${name}-nohistory`;
      return `date-field-${reactId.replace(/:/g, '')}`;
    }, [name, reactId]);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={safeId}
            className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block"
          >
            {label}
          </label>
        )}

        <div className="relative w-full">
          <DatePicker
            id={safeId}
            name={safeName}
            ref={ref}
            selected={safeParseDate(value)}
            onChange={(date) => onChange && onChange(date)}
            minDate={safeParseDate(minDate)}
            maxDate={safeParseDate(maxDate)}
            locale="vi"
            dateFormat="dd/MM/yyyy"
            disabled={disabled}
            placeholderText={placeholder}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="numeric"
            className={cn(
              'w-full rounded-xl p-3 pr-10 border bg-slate-50 text-slate-900 outline-none transition-colors duration-200 text-sm',
              'focus:ring-2 focus:ring-[#fbbf24]/50 focus:border-[#fbbf24] focus:bg-white hover:border-[#fbbf24]/50',
              disabled && 'opacity-60 cursor-not-allowed bg-slate-100 hover:border-slate-200',
              error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200',
              className
            )}
            wrapperClassName="w-full"
            {...props}
          />

          <CalendarDays
            size={18}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors',
              error ? 'text-red-400' : 'text-slate-400',
              disabled && 'opacity-50'
            )}
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs mt-0.5 font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomDatePicker.displayName = 'CustomDatePicker';