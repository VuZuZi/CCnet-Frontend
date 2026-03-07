import clsx from 'clsx';

const variants = {
  yellow: 'bg-yellow text-black hover:bg-orange hover:-translate-y-0.5 hover:shadow-md',
  black: 'bg-black text-white hover:bg-dark hover:-translate-y-0.5',
  outlineDark: 'border-2 border-black text-black bg-transparent hover:bg-black hover:text-white',
  gray: 'bg-[#6b7280] text-white hover:bg-[#4b5563] hover:-translate-y-0.5 hover:shadow-md',
  danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626] hover:-translate-y-0.5 hover:shadow-md',
  secondary: 'bg-[#e5e7eb] text-black hover:bg-[#d1d5db] hover:-translate-y-0.5 hover:shadow-md',
};

export function Button({ 
  children, 
  variant = 'yellow', 
  className, 
  isLoading = false, 
  disabled, 
  ...props 
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-sm transition-all duration-200 cursor-pointer',
        'disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none',
        variant === 'outlineDark' ? 'px-[26px] py-[10px]' : 'px-7 py-3',
        variants[variant],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}