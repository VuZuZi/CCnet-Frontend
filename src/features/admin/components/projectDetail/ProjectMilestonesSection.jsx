function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default function ProjectMilestonesSection({ milestones = [] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 md:px-5">
        <h4 className="text-base font-black text-slate-900">
          Milestones
        </h4>
        <p className="mt-1 text-sm text-slate-500">
          Hiển thị đầy đủ thông tin từng mốc của dự án.
        </p>
      </div>

      {milestones.length ? (
        <div className="space-y-4 px-4 py-4 md:px-5">
          {milestones.map((milestone, index) => (
            <div
              key={milestone?.milestoneId || `${milestone?.title || "milestone"}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Milestone {index + 1}
                  </p>
                  <h5 className="mt-1 text-lg font-black text-slate-900">
                    {milestone?.title || `Mốc ${index + 1}`}
                  </h5>
                </div>

                <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  {formatMoney(milestone?.targetAmount)}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Thời gian
                  </p>
                  <p className="mt-1 text-sm text-slate-800">
                    {formatDate(milestone?.startDate)} - {formatDate(milestone?.endDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Trạng thái
                  </p>
                  <p className="mt-1 text-sm text-slate-800">
                    {milestone?.status || "--"}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Mô tả
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {milestone?.description || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Deliverables
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {milestone?.deliverables || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Địa điểm milestone
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {milestone?.location?.address || "--"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-10 text-center text-sm font-bold text-slate-500">
          Dự án chưa có milestone để hiển thị
        </div>
      )}
    </div>
  );
}
