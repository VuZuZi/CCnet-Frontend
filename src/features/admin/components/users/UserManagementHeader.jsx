import { Users } from "lucide-react";
import AdminHistoryButton from "@/features/admin/components/AdminHistoryButton";

function SmallStat({ label, value, className = "", active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${className} ${
        active ? "ring-2 ring-offset-1 ring-amber-300" : ""
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="mt-1 text-xl font-black leading-none">{value}</p>
    </button>
  );
}

export function UserManagementHeader({
  pageStats,
  activeFilter,
  onFilterChange,
  onOpenHistory,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
            <Users size={11} strokeWidth={2.3} />
            Quản trị viên điều khiển
          </div>

          <h1 className="text-[28px] font-black leading-none tracking-tight text-slate-900">
            Quản lý Người dùng
          </h1>
        </div>

        <div className="flex flex-col items-end gap-3">
          <AdminHistoryButton onClick={onOpenHistory} />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:min-w-[320px]">
            <SmallStat
              label="Tổng"
              value={pageStats.total}
              className="border-slate-200 bg-slate-50 text-slate-700"
              active={activeFilter === "ALL"}
              onClick={() => onFilterChange("ALL")}
            />
            <SmallStat
              label="Hoạt động"
              value={pageStats.active}
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
              active={activeFilter === "ACTIVE"}
              onClick={() => onFilterChange("ACTIVE")}
            />
            <SmallStat
              label="Đã khóa"
              value={pageStats.banned}
              className="border-red-200 bg-red-50 text-red-700"
              active={activeFilter === "BANNED"}
              onClick={() => onFilterChange("BANNED")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagementHeader;