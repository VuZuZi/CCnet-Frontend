import { forwardRef } from 'react';
import { NumericFormat } from 'react-number-format';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const CurrencyInput = forwardRef(({
    label,
    error,
    className,
    value,
    onChange,
    onBlur,
    disabled,
    placeholder = '0',
    suffix = ' VND',
    ...props
}, ref) => {
    return (
        <div className="w-full flex flex-col gap-1">
            {label && (
                <label className="text-sm font-bold text-slate-700">
                    {label}
                </label>
            )}

            <NumericFormat
                getInputRef={ref}
                value={value}
                onValueChange={(values) => {
                    if (onChange) {
                        onChange(values.floatValue || 0);
                    }
                }}
                onBlur={onBlur}
                disabled={disabled}
                thousandSeparator=","
                suffix={suffix}
                allowNegative={false}
                placeholder={placeholder}
                className={cn(
                    "w-full rounded-xl p-3 border bg-slate-50 text-slate-900 font-bold outline-none transition-all duration-200",
                    "focus:ring-2 focus:ring-[#fbbf24]/50 focus:border-[#fbbf24] focus:bg-white",
                    disabled && "opacity-60 cursor-not-allowed bg-slate-100",
                    error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : "border-slate-200",
                    className
                )}
                {...props}
            />

            {error && (
                <span className="text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                </span>
            )}
        </div>
    );
});

CurrencyInput.displayName = 'CurrencyInput';