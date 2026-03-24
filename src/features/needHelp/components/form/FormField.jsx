export function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

export const inputStyles = {
  base: 'block w-full px-4 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-all outline-none',
  normal: 'border-slate-200 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400',
  error: 'border-red-400 focus:ring-2 focus:ring-red-200',
};

export function getInputClass(hasError) {
  return `${inputStyles.base} ${hasError ? inputStyles.error : inputStyles.normal}`;
}
