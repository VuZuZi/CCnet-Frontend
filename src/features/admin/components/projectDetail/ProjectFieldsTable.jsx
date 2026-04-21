import { toDisplayValue } from "../../utils/adminProjectDisplay.utils";

export default function ProjectFieldsTable({
  items = [],
  search = "",
  onSearchChange,
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h4 className="text-base font-black text-slate-900">
            Tất cả Thông tin
          </h4>

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm thông tin..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 lg:w-80"
          />
        </div>
      </div>

      {items.length ? (
        <div className="divide-y divide-slate-100">
          {items.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-2 px-4 py-3.5 transition hover:bg-slate-50/70 md:grid-cols-[220px_minmax(0,1fr)] md:gap-4 md:px-5"
            >
              <div className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {row.label}
              </div>

              <div className="min-w-0 whitespace-pre-wrap break-words break-all text-sm leading-6 text-slate-800">
                {toDisplayValue(row.value)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-10 text-center text-sm font-bold text-slate-500">
          Không có dữ liệu phù hợp để hiển thị
        </div>
      )}
    </div>
  );
}