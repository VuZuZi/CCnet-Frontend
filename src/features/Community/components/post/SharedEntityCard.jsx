import React from "react";
import { Link } from "react-router-dom";

export const SharedEntityCard = ({ entity, isPreview = false }) => {
  if (!entity) return null;

  const isProject = entity.entityModel === "Project";
  const targetId = entity.entityId || entity._id;
  const linkTo = isProject ? `/projects/${targetId}` : `/need-help/${targetId}`;

  // Hàm làm sạch HTML
  const stripHtml = (html) => html?.replace(/<\/?[^>]+(>|$)/g, "") || "";

  return (
    <div className={`${isPreview ? "mt-4" : "px-5 pb-5"}`}>
      <div className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 ease-out hover:scale-[1.015] hover:shadow-xl hover:border-yellow-300 cursor-default">
        {/* 1. Thumbnail */}
        <div className="relative h-[150px] w-full shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:w-[190px] border-r border-slate-50">
          <img
            src={entity.thumbnail || "/placeholder-project.jpg"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="thumbnail"
          />
          <span
            className={`absolute left-2.5 top-2.5 z-10 rounded px-2.5 py-1 text-[9px] font-bold uppercase shadow-sm tracking-wide text-white ${isProject ? "bg-blue-600" : "bg-red-500"}`}
          >
            {isProject ? "Dự án" : "Cần hỗ trợ"}
          </span>
          {entity.isUrgent && (
            <span className="absolute right-2.5 top-2.5 z-10 rounded bg-red-500 px-2.5 py-1 text-[9px] font-bold uppercase text-white shadow-sm animate-pulse">
              Khẩn cấp
            </span>
          )}
        </div>

        {/* 2. Nội dung */}
        <div className="flex flex-1 flex-col gap-2 p-5 min-w-0 bg-white">
          <h4 className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-yellow-600 leading-snug">
            {entity.title}
          </h4>

          {/* Organizer & Location */}
          <div className="space-y-1.5 mt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="material-symbols-outlined text-[16px]">
                person
              </span>
              <span className="truncate font-medium">
                {entity.ownerName || entity.organizerName || "Tổ chức"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="material-symbols-outlined text-[16px]">
                location_on
              </span>
              <span className="truncate">{entity.location || "Toàn quốc"}</span>
            </div>
          </div>

          <p className="line-clamp-2 text-xs italic text-slate-500 mt-1 leading-relaxed">
            "
            {stripHtml(entity.description) ||
              "Nhấn để xem chi tiết dự án này..."}
            "
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Cụm thông tin tiến độ / thời gian */}
            <div className="flex flex-wrap gap-2">
              {entity.isFunded && (
                <div className="flex items-center gap-1 rounded-md border border-yellow-100 bg-yellow-50 px-2.5 py-1 text-[11px] font-bold text-yellow-700">
                  <span className="material-symbols-outlined text-[14px]">
                    payments
                  </span>
                  {entity.fundingPercent || 0}%
                </div>
              )}
              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                <span className="material-symbols-outlined text-[14px]">
                  schedule
                </span>
                {entity.endDateText || entity.daysLeftText || "Đang diễn ra"}
              </div>
            </div>

            {/* NÚT XEM CHI TIẾT MỚI: To hơn, Vàng sáng hơn, Đẹp hơn */}
            {!isPreview && (
              <Link
                to={linkTo}
                className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-900 shadow-md shadow-yellow-400/30 transition-all hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-lg active:translate-y-0"
              >
                Xem chi tiết
                <span className="material-symbols-outlined ml-1 text-[18px]">
                  arrow_forward
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
