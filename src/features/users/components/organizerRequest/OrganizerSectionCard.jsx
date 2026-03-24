export function OrganizerSectionCard({
  icon,
  title,
  children,
  className = "",
  iconClassName = "bg-slate-100 text-slate-700",
}) {
  return (
    <section
      className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] md:p-8 ${className}`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClassName}`}
        >
          {icon}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>

      {children}
    </section>
  );
}

export default OrganizerSectionCard;