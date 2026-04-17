import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const variants = {
  primary: 'bg-primary text-slate-900 shadow-lg hover:scale-105 hover:bg-primary-hover',
  outline: 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50',

  yellow: 'bg-yellow text-black hover:bg-orange hover:-translate-y-0.5 hover:shadow-md',
  black: 'bg-black text-white hover:bg-dark hover:-translate-y-0.5',
  outlineDark: 'border-2 border-black text-black bg-transparent hover:bg-black hover:text-white',
  gray: 'bg-[#6b7280] text-white hover:bg-[#4b5563]',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes = {
  default: 'px-7 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
  sm: 'px-4 py-2 text-sm',
};

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  className,
  isLoading = false,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 cursor-pointer',
        'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-inherit',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang tải...
        </>
      ) : (
        children
      )}
    </button>
  );
}