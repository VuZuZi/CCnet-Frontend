import { Copy } from "lucide-react";

export default function RecipientIdList({
  title,
  ids = [],
  emptyText = "Không có ID nào.",
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ids.join("\n"));
    } catch {
      console.error("Sao chép ID người nhận thất bại.");
    }
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-500">{ids.length} ID</p>
        </div>

        {ids.length ? (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
          >
            <Copy size={12} />
            Sao chép ID
          </button>
        ) : null}
      </div>

      {ids.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="mt-4 flex max-h-72 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {ids.map((id) => (
            <span
              key={id}
              className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
            >
              {id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}