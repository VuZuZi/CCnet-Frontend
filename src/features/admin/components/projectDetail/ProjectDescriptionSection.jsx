export default function ProjectDescriptionSection({ coverUrl, description }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      {coverUrl ? (
        <div className="overflow-hidden border-b border-slate-100 bg-slate-100">
          <img
            src={coverUrl}
            alt="Ảnh bìa dự án"
            className="h-56 w-full object-cover md:h-72 xl:h-80"
          />
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center border-b border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 md:h-72 xl:h-80">
          Không có ảnh bìa
        </div>
      )}

      <div className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-base font-black text-slate-900">Mô tả Dự án</h4>
        </div>

        <div className="rounded-2xl bg-slate-50/80 px-4 py-3">
          <p className="whitespace-pre-wrap break-words break-all text-sm leading-7 text-slate-700">
            {description || "Không có mô tả"}
          </p>
        </div>
      </div>
    </div>
  );
}