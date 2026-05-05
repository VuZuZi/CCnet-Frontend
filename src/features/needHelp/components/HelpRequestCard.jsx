import { Link } from "react-router-dom";
import {
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Share2,
  AlertCircle,
} from "lucide-react";

import { formatDate, formatVND } from "@/shared/lib/formatters";
import {
  HELP_REQUEST_CATEGORIES,
  URGENCY_LEVELS,
} from "../validations/helpRequestSchema";

const CATEGORY_LABELS = Object.fromEntries(
  HELP_REQUEST_CATEGORIES.map((item) => [item.value, item.label]),
);

const URGENCY_MAP = Object.fromEntries(
  URGENCY_LEVELS.map((item) => [item.value, item]),
);

function getCoverImage(evidences = []) {
  return (
    evidences.find((item) => item?.mediaType === "image" || !item?.mediaType)
      ?.url || null
  );
}

function formatCompactAmount(amountNeeded = 0) {
  const amount = Number(amountNeeded || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Hỗ trợ linh hoạt";
  }

  if (amount >= 1_000_000_000_000) {
    return `${(amount / 1_000_000_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} nghìn tỷ đ`;
  }

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} tỷ đ`;
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} triệu đ`;
  }

  return formatVND(amount);
}

function getRequesterName(requesterId) {
  if (!requesterId) return "Người yêu cầu từ cộng đồng";
  if (typeof requesterId === "object") {
    return (
      requesterId.fullName ||
      requesterId.username ||
      "Người yêu cầu từ cộng đồng"
    );
  }
  return "Người yêu cầu từ cộng đồng";
}

function getMediaUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.url || value.secure_url || value.path || "";
}

function getRequesterAvatar(requesterId) {
  if (!requesterId || typeof requesterId !== "object") return "";

  return (
    getMediaUrl(requesterId.avatar) ||
    getMediaUrl(requesterId.avatarUrl) ||
    getMediaUrl(requesterId.photoURL) ||
    getMediaUrl(requesterId.profileImage) ||
    getMediaUrl(requesterId.user?.avatar) ||
    ""
  );
}

function HelpRequestCard({ helpRequest, onShare }) {
  const {
    _id,
    title,
    story,
    category,
    urgencyLevel,
    location,
    amountNeeded,
    createdAt,
    evidences = [],
    requesterId,
  } = helpRequest || {};

  const coverImage = getCoverImage(evidences);
  const requesterName = getRequesterName(requesterId);
  const requesterAvatar = getRequesterAvatar(requesterId);
  const categoryLabel = CATEGORY_LABELS[category] || "Khác";
  const urgency = URGENCY_MAP[urgencyLevel];
  const compactAmount = formatCompactAmount(amountNeeded);
  const isCritical = urgencyLevel === "critical" || urgencyLevel === "high";

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onShare) {
      const shareData = {
        entityId: _id,
        entityModel: "NeedHelp",
        title: title,
        thumbnail: coverImage || "",
        description: story || "",
        ownerName: requesterName,
        location: location?.address || "Đang cập nhật",
        endDateText: "Đang kêu gọi hỗ trợ",
        isUrgent: isCritical,
      };
      onShare(shareData);
    }
  };

  return (
    <Link
      to={`/need-help/${_id}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
    >
      {/* 1. Phần Ảnh Bìa & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title || "Yêu cầu trợ giúp"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-slate-100 to-sky-50 px-6 text-center text-sm font-semibold text-slate-400">
            Không có ảnh bìa
          </div>
        )}

        {/* Badges Top */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] shadow-sm ${
              isCritical
                ? "bg-red-500 text-white animate-pulse"
                : urgency?.color || "bg-slate-100 text-slate-700"
            }`}
          >
            {isCritical && <AlertCircle size={12} strokeWidth={3} />}
            {urgency?.label || urgencyLevel || "Trung bình"}
          </span>

          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700 shadow-sm backdrop-blur">
            {categoryLabel}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent" />
      </div>

      {/* 2. Phần Nội dung Chi tiết */}
      <div className="flex flex-1 flex-col p-5">
        {/* Tiêu đề & Mô tả */}
        <div className="mb-4">
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-amber-600">
            {title || "Yêu cầu chưa có tiêu đề"}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500 italic">
            "{story || "Yêu cầu này chưa có câu chuyện mô tả."}"
          </p>
        </div>

        {/* Khối Thông tin (Icon + Text) */}
        <div className="mb-5 grid gap-2.5 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <MapPin size={16} className="text-slate-400 shrink-0" />
            <span className="line-clamp-1 font-medium">
              {location?.address || "Chưa có địa điểm cụ thể"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <CircleDollarSign size={16} className="text-amber-500 shrink-0" />
            <span className="line-clamp-1 font-bold text-amber-700">
              {compactAmount}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <CalendarDays size={16} className="text-slate-400 shrink-0" />
            <span className="font-medium">
              {formatDate(createdAt) || "Gần đây"}
            </span>
          </div>
        </div>

        {/* 3. Phần Footer (Tác giả & Nút Action) */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 overflow-hidden">
            {requesterAvatar ? (
              <img
                src={requesterAvatar}
                alt={requesterName}
                className="size-8 shrink-0 rounded-full bg-slate-200 object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500">
                {requesterName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">
                {requesterName}
              </p>
              <p className="text-[10px] text-slate-500">Người yêu cầu</p>
            </div>
          </div>

          {/* Nút Share nổi bật hơn */}
          <button
            onClick={handleShareClick}
            className="group/share flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-600 transition-all hover:bg-amber-400 hover:text-slate-900 hover:shadow-md hover:shadow-amber-400/20 active:scale-95"
          >
            <Share2
              size={14}
              strokeWidth={2.5}
              className="transition-transform group-hover/share:-rotate-12"
            />
            Chia sẻ
          </button>
        </div>
      </div>
    </Link>
  );
}

export default HelpRequestCard;
