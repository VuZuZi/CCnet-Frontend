import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button/Button";

const CATEGORY_LABELS = {
  Y_TE: "Y tế",
  GIAO_DUC: "Giáo dục",
  MOI_TRUONG: "Môi trường",
  THIEN_TAI: "Thiên tai",
  XAY_DUNG: "Xây dựng",
};

const CATEGORY_STYLES = {
  Y_TE: "bg-rose-500",
  GIAO_DUC: "bg-sky-500",
  MOI_TRUONG: "bg-emerald-500",
  THIEN_TAI: "bg-orange-500",
  XAY_DUNG: "bg-slate-700",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1469571486292-b53601010376?auto=format&fit=crop&w=1200&q=80";

const formatVnd = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function ProjectCard({ project }) {
  const projectId = project?._id || project?.id;
  const title = project?.title || "Dự án cộng đồng";
  const description =
    stripHtml(project?.summary || project?.description) ||
    "Dự án đang kêu gọi cộng đồng chung tay hỗ trợ.";
  const targetAmount = Number(project?.targetAmount || 0);
  const currentAmount = Number(project?.currentAmount || 0);
  const progress =
    targetAmount > 0
      ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
      : 0;
  const image = project?.coverMedia?.url || project?.image || FALLBACK_IMAGE;
  const category = project?.category || "KHAC";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.14)]">
      <div
        className="relative h-56 overflow-hidden bg-slate-100 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-slate-950/5 to-transparent transition duration-300 group-hover:from-slate-950/10" />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-sm ${CATEGORY_STYLES[category] || "bg-amber-500"}`}
        >
          {CATEGORY_LABELS[category] || category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-black leading-7 text-slate-900 transition group-hover:text-amber-600">
          {title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
          {description}
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-black text-slate-900">
              {progress}% mục tiêu
            </span>
            <span className="font-medium text-slate-500">
              {formatVnd(targetAmount)}
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#F59E0B_0%,#FB7185_100%)] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Đã ghi nhận</span>
            <span>{formatVnd(currentAmount)}</span>
          </div>
        </div>

        <div className="mt-6">
          <Link to={projectId ? `/projects/${projectId}` : "/projects"}>
            <Button variant="primary" className="w-full !rounded-xl !py-3">
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
};
