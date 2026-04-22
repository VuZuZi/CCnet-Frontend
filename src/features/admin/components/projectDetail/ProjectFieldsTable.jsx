import { Search, FileBadge2 } from "lucide-react";

function normalizeValue(value) {
  if (value === null || value === undefined) return "--";

  if (typeof value === "string") {
    return value.trim() ? value : "--";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString("vi-VN") : "--";
  }

  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  if (Array.isArray(value)) {
    if (!value.length) return "--";
    return value
      .map((item) => {
        if (item === null || item === undefined) return null;
        if (typeof item === "string") return item.trim() || null;
        if (typeof item === "object") {
          return (
            item?.name ||
            item?.title ||
            item?.label ||
            item?.value ||
            JSON.stringify(item)
          );
        }
        return String(item);
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.title ||
      value?.label ||
      value?.value ||
      JSON.stringify(value)
    );
  }

  return String(value);
}

function FieldRow({ item, index }) {
  const value = normalizeValue(item?.value);

  return (
    <div
      className={`grid gap-2 px-4 py-4 md:grid-cols-[280px_minmax(0,1fr)] md:gap-5 md:px-5 ${
        index !== 0 ? "border-t border-slate-200" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-[#FBBF24]">
          <FileBadge2 size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
            {item?.label || "--"}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="break-words text-sm font-semibold leading-7 text-slate-800 whitespace-pre-wrap">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ProjectFieldsTable({
  items = [],
  search = "",
  onSearchChange,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFF9EC_100%)] shadow-[0_12px_40px_rgba(251,191,36,0.10)]">
      <div className="border-b border-amber-100/80 px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FBBF24] text-white shadow-sm">
              <FileBadge2 size={20} strokeWidth={2.3} />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 md:text-lg">
                Thông tin chi tiết
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                Hiển thị các trường dữ liệu quan trọng của dự án theo bố cục rõ ràng hơn.
              </p>
            </div>
          </div>

          <div className="relative w-full lg:max-w-[360px]">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search size={16} />
            </span>
            <input
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Tìm nhanh theo tên trường..."
              className="h-12 w-full rounded-2xl border border-amber-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FBBF24] focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>
      </div>

      {items.length ? (
        <div className="p-3 md:p-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            {items.map((item, index) => (
              <FieldRow
                key={`${item?.label || "field"}-${index}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-[#FBBF24]">
            <Search size={22} strokeWidth={2.2} />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-600">
            Không có dữ liệu phù hợp với từ khóa tìm kiếm
          </p>
        </div>
      )}
    </section>
  );
}