import {
  HeartPulse,
  GraduationCap,
  TreePine,
  LifeBuoy,
  Hammer,
  LayoutGrid,
  Check,
  Loader2,
} from "lucide-react";

const CATEGORY_CONFIG = [
  {
    value: "Y_TE",
    title: "Y tế & Sức khỏe",
    icon: HeartPulse,
    bgClass: "bg-card-blue-bg border-blue-100",
    textClass: "text-blue-900",
    subTextClass: "text-blue-700",
    iconClass: "text-blue-500",
  },
  {
    value: "GIAO_DUC",
    title: "Giáo dục",
    icon: GraduationCap,
    bgClass: "bg-card-purple-bg border-purple-100",
    textClass: "text-purple-900",
    subTextClass: "text-purple-700",
    iconClass: "text-purple-500",
  },
  {
    value: "MOI_TRUONG",
    title: "Môi trường",
    icon: TreePine,
    bgClass: "bg-card-green-bg border-green-100",
    textClass: "text-green-900",
    subTextClass: "text-green-700",
    iconClass: "text-green-500",
  },
  {
    value: "THIEN_TAI",
    title: "Cứu trợ khẩn cấp",
    icon: LifeBuoy,
    bgClass: "bg-red-50 border-red-100",
    textClass: "text-red-900",
    subTextClass: "text-red-700",
    iconClass: "text-red-500",
  },
  {
    value: "XAY_DUNG",
    title: "Xây dựng",
    icon: Hammer,
    bgClass: "bg-card-yellow-bg border-amber-100",
    textClass: "text-amber-900",
    subTextClass: "text-amber-700",
    iconClass: "text-amber-500",
  },
];

function CategoryCard({
  category,
  isActive,
  visibleCount,
  isCountsLoading,
  onSelect,
}) {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        category.bgClass,
        "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-6 text-center transition-all group",
        isActive
          ? "ring-2 ring-amber-400 shadow-md -translate-y-0.5"
          : "hover:shadow-md",
      ].join(" ")}
    >
      {isActive ? (
        <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-sm">
          <Check size={15} strokeWidth={3} />
        </span>
      ) : null}

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
        <Icon className={category.iconClass} size={32} />
      </div>

      <h3 className={`font-bold ${category.textClass}`}>{category.title}</h3>

      <p
        className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${category.subTextClass}`}
      >
        {isCountsLoading ? (
          <>
            <Loader2 className="animate-spin" size={12} />
            Đang cập nhật...
          </>
        ) : (
          <>{visibleCount} dự án</>
        )}
      </p>
    </button>
  );
}

export function CategoryExplore({
  activeCategory = "",
  onCategorySelect,
  countsByCategory = {},
  isCountsLoading = false,
}) {
  const handleSelect = (value) => {
    if (!onCategorySelect) return;
    onCategorySelect(activeCategory === value ? "" : value);
  };

  return (
    <section className="mb-12 mt-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <LayoutGrid className="text-amber-500" size={24} />
          Khám phá theo danh mục
        </h2>

        {activeCategory ? (
          <button
            type="button"
            onClick={() => onCategorySelect?.("")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Xóa bộ lọc danh mục
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        {CATEGORY_CONFIG.map((category) => {
          const isActive = activeCategory === category.value;
          const visibleCount = Number(countsByCategory?.[category.value] || 0);

          return (
            <CategoryCard
              key={category.value}
              category={category}
              isActive={isActive}
              visibleCount={visibleCount}
              isCountsLoading={isCountsLoading}
              onSelect={() => handleSelect(category.value)}
            />
          );
        })}
      </div>
    </section>
  );
}

export default CategoryExplore;