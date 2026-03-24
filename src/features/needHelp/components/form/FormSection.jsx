export function FormSection({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-slate-900 mb-6">{title}</h2>
      )}
      {children}
    </div>
  );
}
