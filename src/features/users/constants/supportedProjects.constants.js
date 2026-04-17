import {
  BadgeCheck,
  BadgeX,
  CircleCheckBig,
  CircleDashed,
  Sparkles,
  XCircle,
} from "lucide-react";

export const FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "JOINED", label: "Đã tham gia" },
  { value: "IN_PROGRESS", label: "Đang hoạt động" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
];

export const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop";

export const STATUS_CONFIG = {
  JOINED: {
    label: "Đã tham gia",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: BadgeCheck,
  },
  IN_PROGRESS: {
    label: "Đang hoạt động",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    icon: Sparkles,
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    icon: CircleCheckBig,
  },
  PENDING: {
    label: "Chờ duyệt",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: CircleDashed,
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: BadgeX,
  },
};