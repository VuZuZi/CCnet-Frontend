const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  DECLINED: {
    label: "Từ chối",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function OrganizerRequestStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Không xác định",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default OrganizerRequestStatusBadge;