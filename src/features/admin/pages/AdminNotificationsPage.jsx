import { useNavigate } from "react-router-dom";
import {
  BellRing,
  History,
  SendHorizontal,
  ShieldCheck,
} from "lucide-react";
import AdminNotificationComposer from "../components/AdminNotificationComposer";
import AdminHistoryButton from "../components/AdminHistoryButton";

function StatCard({ icon: Icon, label, value, tone = "amber" }) {
  const toneMap = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.22)] ${
        toneMap[tone] || toneMap.amber
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
          {label}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

export function AdminNotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.18)]">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                <BellRing size={14} />
                Thông báo Quản trị
              </div>

              <h1 className="mt-4 text-[28px] font-black leading-none tracking-tight text-slate-900 sm:text-[46px]">
                Thông báo
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Tạo và gửi thông báo hệ thống trong ứng dụng đến tất cả người dùng, theo vai trò hoặc đến những người dùng được chọn với quy trình quản trị minh bạch và có thể theo dõi.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 xl:min-w-[520px]">
              <AdminHistoryButton
                onClick={() => navigate("/admin/notifications/history")}
              >
                Xem Lịch sử
              </AdminHistoryButton>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                <StatCard
                  icon={SendHorizontal}
                  label="Chế độ Gửi"
                  value="Tất cả hoặc tùy chỉnh"
                  tone="amber"
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Đối tượng"
                  value="Hỗ trợ nhóm vai trò"
                  tone="slate"
                />
                <StatCard
                  icon={History}
                  label="Theo dõi"
                  value="Có sẵn lịch sử"
                  tone="emerald"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminNotificationComposer />
    </div>
  );
}

export default AdminNotificationsPage;