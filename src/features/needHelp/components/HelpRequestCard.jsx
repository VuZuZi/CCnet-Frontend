import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  MapPin,
  UserRound,
  Share2,
} from "lucide-react";
import { ShareModal } from "../../Community/components/common/ShareModal";

import { formatCurrency, formatDate } from "@/shared/lib/formatters";

const CATEGORY_LABELS = {
  Y_TE: "Medical Aid",
  GIAO_DUC: "Education",
  THIEN_TAI: "Disaster Relief",
  XAY_DUNG: "Construction",
  MOI_TRUONG: "Environment",
  KHAC: "Other",
};

const URGENCY_STYLES = {
  CRITICAL: "bg-rose-50 text-rose-700",
  HIGH: "bg-orange-50 text-orange-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW: "bg-emerald-50 text-emerald-700",
};

export function HelpRequestCard({ helpRequest }) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const coverImage = helpRequest.evidences?.[0]?.url;
  const categoryLabel = CATEGORY_LABELS[helpRequest.category] || "Other";
  const urgencyStyle = URGENCY_STYLES[helpRequest.urgencyLevel] || URGENCY_STYLES.MEDIUM;

  const requesterName = helpRequest.requesterId?.fullName || "Anonymous";
  const locationAddress = helpRequest.location?.address || "Location not specified";

  const getInitials = (name) => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "A"
    );
  };

  const shareData = {
    entityId: helpRequest._id,
    entityModel: "NeedHelp",
    title: helpRequest.title,
    thumbnail: coverImage || "",
    description: helpRequest.story || "Xin hãy chung tay giúp đỡ hoàn cảnh này.",
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_-6px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.45),0_10px_20px_-18px_rgba(245,158,11,0.45)]">
        {/* Banner Image */}
        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-sm">
              {categoryLabel}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${urgencyStyle}`}>
              {helpRequest.urgencyLevel}
            </span>
          </div>

          <div className="h-full w-full">
            {coverImage ? (
              <img
                src={coverImage}
                alt={helpRequest.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-bold text-slate-400">
                {getInitials(requesterName)}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-amber-600">
                <Link
                  to={`/need-help/${helpRequest._id}`}
                  className="focus:outline-none before:absolute before:inset-0 before:z-0"
                >
                  {helpRequest.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                {helpRequest.story}
              </p>
            </div>

            <div className="hidden flex-shrink-0 items-center text-slate-300 transition-colors group-hover:text-amber-500 2xl:flex">
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-auto pt-4">
            <div className="space-y-2 border-t border-slate-50 pt-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <UserRound size={13} className="text-slate-400" />
                <span className="truncate">{requesterName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={13} className="text-slate-400" />
                <span className="truncate">{locationAddress}</span>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                  <CircleDollarSign size={14} className="text-amber-500" />
                  <span className="text-sm">
                    {helpRequest.amountNeeded
                      ? formatCurrency(helpRequest.amountNeeded)
                      : "Flexible"}
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <CalendarDays size={12} />
                    {formatDate(helpRequest.createdAt) || "Recently"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsShareOpen(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600"
                    title="Share this request"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sharedData={shareData}
        initialText={`Trường hợp khẩn cấp: "${helpRequest.title}". Mong mọi người lan toả thông điệp này! 🙏`}
      />
    </>
  );
}

export default HelpRequestCard;
