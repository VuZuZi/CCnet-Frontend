import { ADMIN_UI_PROJECT_STATUS } from "./projectStatus.utils";

export const PROJECTS_PER_PAGE = 8;

export const FILTER_CONFIG = [
  {
    key: "ALL",
    label: "Tất cả",
    activeClassName:
      "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-900 shadow-sm",
    idleClassName:
      "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL,
    label: "Chờ kiểm duyệt",
    activeClassName:
      "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-900 shadow-sm",
    idleClassName:
      "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.ACTIVE,
    label: "Đang hoạt động",
    activeClassName:
      "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-sm",
    idleClassName:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.UPDATING,
    label: "Đang cập nhật",
    activeClassName:
      "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-sm",
    idleClassName:
      "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.PAUSED,
    label: "Tạm dừng",
    activeClassName:
      "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm",
    idleClassName:
      "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.COMPLETED,
    label: "Đã hoàn thành",
    activeClassName:
      "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm",
    idleClassName:
      "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.CANCELLED,
    label: "Đã hủy",
    activeClassName:
      "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm",
    idleClassName:
      "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
];

export const createInitialReasonModalState = () => ({
  open: false,
  project: null,
  actionKey: "",
  nextStatus: "",
  actionType: "",
});

export function paginateItems(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getPaginationMeta(totalItems, page, pageSize) {
  const safeTotal = Number(totalItems || 0);
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startItem = safeTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, safeTotal);

  return {
    totalPages,
    currentPage,
    startItem,
    endItem,
  };
}
