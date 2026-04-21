import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Flag,
  MapPin,
  Package,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getStatusLabel(status) {
  const normalized = String(status || "").toUpperCase();

  const map = {
    PENDING: "Đang chờ",
    IN_PROGRESS: "Đang thực hiện",
    PROCESSING: "Đang xử lý",
    APPROVED: "Đã duyệt",
    COMPLETED: "Hoàn thành",
    REJECTED: "Từ chối",
    CANCELLED: "Đã hủy",
    REVISION_REQUESTED: "Yêu cầu chỉnh sửa",
  };

  return map[normalized] || status || "--";
}

function getStatusClass(status) {
  const normalized = String(status || "").toUpperCase();

  if (["APPROVED", "COMPLETED"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["REJECTED", "CANCELLED"].includes(normalized)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (["IN_PROGRESS", "PROCESSING"].includes(normalized)) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (["REVISION_REQUESTED"].includes(normalized)) {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function getTextValue(value) {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string" && value.trim() === "") return "--";
  return String(value);
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-[#FBBF24]">
          <Icon size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectMilestonesSection({ milestones = [] }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFF8E6_100%)] shadow-[0_12px_40px_rgba(251,191,36,0.10)]">
      <div className="border-b border-amber-100/80 px-4 py-4 md:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24] text-white shadow-sm">
            <Flag size={20} strokeWidth={2.4} />
          </div>

          <div>
            <h4 className="text-base font-black text-slate-900 md:text-lg">
              Milestones
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              Hiển thị đầy đủ thông tin từng mốc của dự án.
            </p>
          </div>
        </div>
      </div>

      {milestones.length ? (
        <div className="space-y-5 px-4 py-4 md:px-6 md:py-6">
          {milestones.map((milestone, index) => (
            <article
              key={
                milestone?.milestoneId ||
                `${milestone?.title || "milestone"}-${index}`
              }
              className="overflow-hidden rounded-[26px] border border-amber-100 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="border-b border-amber-100 bg-[linear-gradient(135deg,#FFF8DB_0%,#FFFDF6_100%)] px-4 py-4 md:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="inline-flex max-w-full items-center rounded-full border border-amber-200 bg-amber-100/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-amber-800">
                      Milestone {index + 1}
                    </div>

                    <h5 className="mt-3 break-words text-xl font-black leading-tight text-slate-900 md:text-2xl">
                      {milestone?.title || `Mốc ${index + 1}`}
                    </h5>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-extrabold text-amber-800 shadow-sm">
                        <CircleDollarSign size={16} />
                        {formatMoney(milestone?.targetAmount)}
                      </div>

                      <div
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${getStatusClass(
                          milestone?.status
                        )}`}
                      >
                        {getStatusLabel(milestone?.status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[360px] lg:max-w-[430px]">
                    <InfoBlock
                      icon={CalendarDays}
                      label="Thời gian"
                      value={`${formatDate(milestone?.startDate)} - ${formatDate(
                        milestone?.endDate
                      )}`}
                    />
                    <InfoBlock
                      icon={Flag}
                      label="Trạng thái"
                      value={getStatusLabel(milestone?.status)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-4 py-4 md:px-5 md:py-5">
                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:col-span-1">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-[#FBBF24]">
                        <FileText size={18} strokeWidth={2.2} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                          Mô tả
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                          {getTextValue(milestone?.description)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:col-span-1">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-[#FBBF24]">
                        <Package size={18} strokeWidth={2.2} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                          Deliverables
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                          {getTextValue(milestone?.deliverables)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:col-span-1">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-[#FBBF24]">
                        <MapPin size={18} strokeWidth={2.2} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                          Địa điểm milestone
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                          {getTextValue(milestone?.location?.address)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-[#FBBF24]">
            <Flag size={24} strokeWidth={2.2} />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-600">
            Dự án chưa có milestone để hiển thị
          </p>
        </div>
      )}
    </section>
  );
}