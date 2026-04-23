import { Users } from "lucide-react";
import AdminHistoryButton from "@/features/admin/components/AdminHistoryButton";

function SmallStat({ label, value, className = "", active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${className} ${
        active ? "ring-2 ring-offset-1 ring-amber-300" : ""
      }`}
    >
      <p className="ccnet-nowrap-label text-[10px] font-bold uppercase tracking-[0.08em]">
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
    <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700">
            <Users size={11} strokeWidth={2.3} />
            Quản trị viên điều khiển
          </div>

          <h1 className="text-[clamp(1.5rem,2.5vw,1.75rem)] font-black leading-tight tracking-tight text-slate-900">
            Quản lý Người dùng
          </h1>
        </div>

        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 xl:w-auto xl:items-end">
          <AdminHistoryButton onClick={onOpenHistory} />

          <div
            className="ccnet-auto-grid w-full gap-2 xl:max-w-[360px]"
            style={{ "--ccnet-grid-min": "104px" }}
          >
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
