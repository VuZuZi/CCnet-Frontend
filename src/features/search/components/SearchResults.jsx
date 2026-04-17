import clsx from "clsx";

function ItemIcon({ item }) {
  const letter = String(item?.title || "?")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-200 font-bold text-slate-900 shadow-sm">
      {item?.avatar ? (
        <img
          src={item.avatar}
          alt={item.title}
          className="h-full w-full object-cover"
        />
      ) : (
        letter
      )}
    </div>
  );
}

function StandardCard({ item, onOpen }) {
  const getKindLabel = (kind) => {
    switch (kind) {
      case "communitypost":
        return "Bài viết";
      case "needhelp":
        return "Cần giúp đỡ";
      case "project":
        return "Dự án";
      case "organizer":
        return "Tổ chức";
      case "user":
        return "Người dùng";
      default:
        return kind || "Kết quả";
    }
  };

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      className="flex w-full items-start gap-3 rounded-[26px] border border-slate-200 bg-white p-5 text-left shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-250 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
    >
      <ItemIcon item={item} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="truncate text-[18px] font-bold text-slate-900">
            {item.title || "Chưa có tiêu đề"}
          </h3>

          <span
            className={clsx(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
              item.kind === "organizer" && "bg-amber-100 text-amber-800",
              item.kind === "project" && "bg-blue-100 text-blue-800",
              item.kind === "needhelp" && "bg-rose-100 text-rose-800",
              item.kind === "communitypost" &&
                "bg-emerald-100 text-emerald-800",
              item.kind === "user" && "bg-slate-100 text-slate-700",
            )}
          >
            {getKindLabel(item.kind)}
          </span>
        </div>

        {item.subtitle ? (
          <p className="line-clamp-2 text-[15px] leading-7 text-slate-600">
            {item.subtitle}
          </p>
        ) : null}
      </div>
    </button>
  );
}

function CommunityPostPreview({ item, onOpen }) {
  const payload = item?.payload || {};
  const images = Array.isArray(payload.images) ? payload.images : [];
  const stats = payload.stats || {};

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      className="block w-full rounded-[26px] border border-slate-200 bg-white p-5 text-left shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-250 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ItemIcon
            item={{
              title: payload.author?.fullName || item.title,
              avatar: payload.author?.avatar || item.avatar,
            }}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[16px] font-bold text-slate-900">
                {payload.author?.fullName || "Người ẩn danh"}
              </h3>

              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                Bài viết
              </span>
            </div>

            <p className="mt-1 text-xs font-medium uppercase text-slate-400">
              {payload.privacy === "public"
                ? "Công khai"
                : payload.privacy || "Công khai"}{" "}
              •{" "}
              {payload.createdAt
                ? new Date(payload.createdAt).toLocaleDateString("vi-VN")
                : ""}
            </p>
          </div>
        </div>

        <span className="text-slate-300">
          <span className="material-symbols-outlined">chevron_right</span>
        </span>
      </div>

      <div className="mt-4">
        <p className="line-clamp-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
          {payload.content || item.title || ""}
        </p>
      </div>

      {images.length > 0 ? (
        <div
          className={clsx(
            "mt-4 grid gap-1 overflow-hidden rounded-2xl bg-slate-100",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {images.slice(0, 2).map((img, index) => (
            <div
              key={img.publicId || img.url || index}
              className={clsx(
                "aspect-video bg-cover bg-center bg-no-repeat",
                images.length === 1 && "min-h-[260px]",
              )}
              style={{ backgroundImage: `url("${img.url}")` }}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-4 text-sm font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">
            favorite
          </span>
          <span>{Number(stats.likes || 0)} Lượt thích</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span>{Number(stats.comments || 0)} Bình luận</span>
        </div>

        <div className="ml-auto text-xs font-semibold text-amber-700">
          Click để xem chi tiết
        </div>
      </div>
    </button>
  );
}

function EmptyState({ query }) {
  return (
    <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h3 className="text-xl font-bold text-slate-800">
        Không tìm thấy kết quả phù hợp
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Không có dữ liệu nào khớp với từ khóa{" "}
        <span className="font-semibold text-slate-700">"{query}"</span>.
      </p>
    </div>
  );
}

export default function SearchResults({
  results = [],
  loading = false,
  query = "",
  onOpen,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-5/6 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results.length) {
    return <EmptyState query={query} />;
  }

  return (
    <div className="space-y-4">
      {results.map((item) =>
        item.kind === "communitypost" ? (
          <CommunityPostPreview
            key={`${item.kind}:${item.id}`}
            item={item}
            onOpen={onOpen}
          />
        ) : (
          <StandardCard
            key={`${item.kind || "item"}:${item.id}`}
            item={item}
            onOpen={onOpen}
          />
        ),
      )}
    </div>
  );
}
