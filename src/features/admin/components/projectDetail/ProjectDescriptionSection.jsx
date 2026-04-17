export default function ProjectDescriptionSection({ coverUrl, description }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      {coverUrl ? (
        <div className="mb-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
          <img
            src={coverUrl}
            alt="Ảnh bìa dự án"
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
      ) : (
        <div className="mb-5 flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 md:h-80">
          Không có ảnh bìa
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-base font-black text-slate-900">
          Mô tả Dự án
        </h4>
      </div>

      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
        {description}
      </p>
    </div>
  );
}