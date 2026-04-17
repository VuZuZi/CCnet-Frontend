import clsx from "clsx";
import {
  ChevronDown,
  LayoutGrid,
  UserRound,
  FolderKanban,
  HeartHandshake,
  Newspaper,
  Users,
} from "lucide-react";

const FILTERS = [
  { key: "all", label: "Tất cả", icon: LayoutGrid },
  { key: "organizer", label: "Tổ chức", icon: UserRound },
  { key: "project", label: "Dự án", icon: FolderKanban },
  { key: "needhelp", label: "Cần giúp đỡ", icon: HeartHandshake },
  { key: "communitypost", label: "Bài viết", icon: Newspaper },
  { key: "user", label: "Người dùng", icon: Users },
];

function ToggleRow({ label, checked = false, disabled = false, onChange }) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 py-2",
        disabled && "opacity-50",
      )}
    >
      <span className="text-[16px] font-medium text-slate-700">{label}</span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={clsx(
          "relative h-8 w-[54px] rounded-full transition-all duration-250",
          checked ? "bg-amber-400" : "bg-slate-300",
          disabled && "cursor-not-allowed",
        )}
      >
        <span
          className={clsx(
            "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all duration-250",
            checked ? "left-[26px]" : "left-1",
          )}
        />
      </button>
    </div>
  );
}

function SelectRow({
  label,
  value,
  disabled = false,
  options = [],
  onChange,
  placeholder = "Tất cả",
}) {
  return (
    <div className={clsx("py-2", disabled && "opacity-50")}>
      <label className="mb-2 block text-[16px] font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <select
          disabled={disabled}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={clsx(
            "w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-[15px] text-slate-700 outline-none transition-all",
            disabled
              ? "cursor-not-allowed bg-slate-100"
              : "focus:border-amber-300 focus:ring-4 focus:ring-amber-100",
          )}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => {
            const item =
              typeof option === "string"
                ? { value: option, label: option }
                : option;

            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>
  );
}

export default function SearchSidebar({
  activeType = "all",
  counts = {},
  onChange,
  filters,
  onFilterChange,
  locationOptions = [],
  postFiltersEnabled = false,
}) {
  const safeCounts = {
    all: Number(counts?.all || 0),
    organizer: Number(counts?.organizer || 0),
    project: Number(counts?.project || 0),
    needhelp: Number(counts?.needhelp || 0),
    communitypost: Number(counts?.communitypost || 0),
    user: Number(counts?.user || 0),
  };

  return (
    <aside className="sticky top-24 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <h2 className="mb-5 text-[18px] font-bold text-slate-900">
        Kết quả tìm kiếm
      </h2>

      <div className="space-y-2">
        {FILTERS.map((item) => {
          const count = safeCounts[item.key] ?? 0;
          const active = activeType === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange?.(item.key)}
              className={clsx(
                "group flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-all duration-250",
                active
                  ? "bg-amber-300 text-slate-900 shadow-sm"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-250",
                    active
                      ? "bg-white/70 text-amber-700"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white",
                  )}
                >
                  <Icon size={18} />
                </div>

                <span className="text-[16px] font-semibold">{item.label}</span>
              </div>

              <span
                className={clsx(
                  "min-w-[28px] rounded-full px-2 py-1 text-center text-xs font-bold transition-all duration-250",
                  active
                    ? "bg-white/75 text-slate-900"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div>
        <h3 className="mb-3 text-[16px] font-bold text-slate-900">
          Bộ lọc bài viết
        </h3>

        {!postFiltersEnabled ? (
          <p className="mb-3 text-sm text-slate-500">
            Chọn <span className="font-semibold">Tất cả</span> hoặc{" "}
            <span className="font-semibold">Bài viết</span> để dùng bộ lọc bài
            viết.
          </p>
        ) : null}

        <div className="space-y-1">
          <ToggleRow
            label="Bài viết mới đây"
            checked={!!filters?.recentOnly}
            disabled={!postFiltersEnabled}
            onChange={(value) => onFilterChange?.({ recentOnly: value })}
          />

          <ToggleRow
            label="Bài viết bạn đã xem"
            checked={!!filters?.viewedOnly}
            disabled={!postFiltersEnabled}
            onChange={(value) => onFilterChange?.({ viewedOnly: value })}
          />

          <SelectRow
            label="Ngày đăng"
            value={filters?.dateOrder || "newest"}
            disabled={!postFiltersEnabled}
            onChange={(value) =>
              onFilterChange?.({ dateOrder: value || "newest" })
            }
            options={[
              { value: "newest", label: "Mới nhất" },
              { value: "oldest", label: "Cũ nhất" },
            ]}
            placeholder="Tất cả"
          />

          <SelectRow
            label="Địa điểm"
            value={filters?.location || ""}
            disabled={!postFiltersEnabled}
            onChange={(value) => onFilterChange?.({ location: value })}
            options={locationOptions}
            placeholder="Tất cả địa điểm"
          />
        </div>
      </div>
    </aside>
  );
}
