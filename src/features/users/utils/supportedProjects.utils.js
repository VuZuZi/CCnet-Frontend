import { STATUS_CONFIG } from "../constants/supportedProjects.constants";

export function formatDate(dateLike) {
  if (!dateLike) return "Chưa cập nhật";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateLike));
  } catch {
    return "Chưa cập nhật";
  }
}

export function getStatusMeta(item) {
  return STATUS_CONFIG[item?.derivedStatus] || STATUS_CONFIG.PENDING;
}