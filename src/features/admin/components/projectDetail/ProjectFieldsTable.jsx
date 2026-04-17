import { toDisplayValue } from "../../utils/adminProjectDisplay.utils";

export default function ProjectFieldsTable({
  items = [],
  search = "",
  onSearchChange,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h4 className="text-base font-black text-slate-900">Tất cả Thông tin</h4>

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm thông tin..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 md:w-80"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-[24px] border border-slate-200">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-2 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
            <div className="px-4 py-3">Thông tin</div>
            <div className="px-4 py-3">Giá trị</div>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((row) => (
              <div key={row.label} className="grid grid-cols-2">
                <div className="break-words px-4 py-3 text-xs font-bold text-slate-500">
                  {row.label}
                </div>
                <div className="break-words px-4 py-3 text-sm text-slate-800">
                  {toDisplayValue(row.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}