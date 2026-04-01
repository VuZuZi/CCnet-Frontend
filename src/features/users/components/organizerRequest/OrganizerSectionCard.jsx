export function OrganizerSectionCard({
  icon,
  title,
  children,
  className = "",
  iconClassName = "bg-slate-100 text-slate-700",
}) {
  return (
    <section
      className={`rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_4px_24px_rgba(15,23,42,0.04)] md:p-9 ${className}`}
    >
      <div className="mb-7 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
        >
          {icon}
        </div>
        <h2 className="text-[20px] font-bold text-slate-900 md:text-[22px]">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

export default OrganizerSectionCard;