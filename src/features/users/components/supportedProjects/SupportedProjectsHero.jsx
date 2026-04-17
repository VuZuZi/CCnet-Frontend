import { ArrowLeft, FolderHeart, ShieldCheck } from "lucide-react";

export function SupportedProjectsHero({ totalSupported, onBack }) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-amber-200/60 bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF8E6_48%,#FFFCF4_100%)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-200/25 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#F0A500] bg-[linear-gradient(135deg,#FFC533_0%,#FF9800_100%)] px-4 py-2 text-sm font-bold text-[#7A2E00] shadow-[0_10px_22px_rgba(255,152,0,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(255,140,0,0.30)]"
          >
            <ArrowLeft size={16} />
            Quay lại hồ sơ
          </button>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
            <FolderHeart size={13} />
            Volunteer Projects
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Những dự án bạn đã tham gia
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Theo dõi trạng thái tham gia, kiểm tra tiến độ từng dự án và mở
            nhanh trang chi tiết để cập nhật hoạt động mới nhất.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px] lg:grid-cols-1">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700">
                  Tổng dự án
                </p>
                <p className="mt-3 text-4xl font-black text-slate-900">
                  {totalSupported}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Dự án đang được theo dõi
                </p>
              </div>

              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportedProjectsHero;