import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ChevronRight,
  Landmark,
  PiggyBank,
  WalletCards,
} from "lucide-react";

import { useAdminFinanceSummary } from "../hooks/useAdminFinanceQueries";
import { formatProjectCurrencyVND } from "@/features/project/utils/projectDisplay.utils";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { getStatusLabel } from "@/shared/lib/statusLabels";

export default function AdminFinanceSummaryPage() {
  const navigate = useNavigate();
  const [filters] = useState({ page: 1, limit: 15 });
  const { data, isLoading } = useAdminFinanceSummary(filters);

  if (isLoading) return <PageLoader />;

  const overview = data?.overview || {};
  const projects = data?.projects ?? [];

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-black text-slate-900">
            <Activity className="text-emerald-600" size={32} />
            Tổng quan quỹ và giải ngân
          </h1>
          <p className="mt-2 text-slate-500">
            Theo dõi nguồn quỹ đang có, các khoản đã chi và những hạng mục cần xử lý tiếp theo.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          icon={Landmark}
          tone="amber"
          title="Nguồn quỹ dự án hiện có"
          value={formatProjectCurrencyVND(overview.projectEscrowBalance)}
          subtitle={`Đã giải ngân ${formatProjectCurrencyVND(overview.totalDisbursed)}`}
        />
        <OverviewCard
          icon={WalletCards}
          tone="sky"
          title="Ví người dùng trên web"
          value={formatProjectCurrencyVND(overview.userWalletBalance)}
          subtitle="Số dư người dùng đang giữ trong hệ thống"
        />
        <OverviewCard
          icon={PiggyBank}
          tone="emerald"
          title="Quỹ duy trì web"
          value={formatProjectCurrencyVND(overview.webSupportFundBalance)}
          subtitle={`Cộng đồng đã đóng góp ${formatProjectCurrencyVND(overview.inbound?.supportDonations)}`}
        />
        <OverviewCard
          icon={Landmark}
          tone="rose"
          title="Đang chờ giải ngân"
          value={formatProjectCurrencyVND(overview.pendingDisbursementAmount)}
          subtitle="Các khoản đang chờ xác nhận chuyển đi"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <FinancePanel
          title="Dự án có nguồn quỹ nổi bật"
          subtitle="Những dự án đang có nguồn lực tốt để tiếp tục triển khai."
        >
          <div className="space-y-3">
            {(overview.projectBalances || []).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {getStatusLabel(item.status)}
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {formatProjectCurrencyVND(item.availableBalance)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Đã giải ngân {formatProjectCurrencyVND(item.totalDisbursed)}
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    Đang chờ {formatProjectCurrencyVND(item.pendingDisbursementAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </FinancePanel>

        <FinancePanel
          title="Giải ngân gần nhất"
          subtitle="Các khoản chuyển tiền mới nhất giúp bạn theo dõi tiến độ triển khai."
        >
          <div className="space-y-3">
            {(overview.recentDisbursements || []).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {item.projectTitle}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {getStatusLabel(item.status)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {formatProjectCurrencyVND(
                        item.approvedAmount || item.requestedAmount,
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Yêu cầu {formatProjectCurrencyVND(item.requestedAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Ref: {item.bankTransactionRef || "Chưa có"}
                  </span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                    {item.transferredAt
                      ? new Date(item.transferredAt).toLocaleString("vi-VN")
                      : "Chưa chuyển"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </FinancePanel>
      </section>

      <div className="min-w-0 overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
        <div className="ccnet-safe-scroll">
          <table
            className="ccnet-safe-table text-left"
            style={{ "--ccnet-table-min": "1120px" }}
          >
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="w-[32%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Dự án
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Tổng đóng góp
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Quỹ hiện có
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Đã giải ngân
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Đang chờ giải ngân
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Chờ duyệt
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects.map((proj) => (
                <tr
                  key={proj._id}
                  className="group transition-colors hover:bg-slate-50/50"
                >
                  <td className="max-w-[220px] px-6 py-5 sm:max-w-[320px]">
                    <p
                      className="truncate text-sm font-bold text-slate-900"
                      title={proj.title}
                    >
                      {proj.title}
                    </p>
                    <span className="text-[10px] font-medium uppercase text-slate-400">
                      {getStatusLabel(proj.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-700">
                    {formatProjectCurrencyVND(proj.totalDeposited)}
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-slate-900">
                    {formatProjectCurrencyVND(proj.escrowBalance)}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {formatProjectCurrencyVND(proj.totalDisbursed)}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {formatProjectCurrencyVND(proj.pendingDisbursementAmount)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      {proj.pendingEvidenceCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                          Báo cáo {proj.pendingEvidenceCount}
                        </span>
                      )}
                      {proj.pendingDisbursementCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600">
                          Giải ngân {proj.pendingDisbursementCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => navigate(`/admin/finance/${proj._id}`)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 shadow-sm transition-all hover:bg-slate-900 hover:text-white group-hover:scale-110"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon: Icon, tone, title, value, subtitle }) {
  const tones = {
    amber: "border-amber-100 bg-[linear-gradient(180deg,#FFF8E8_0%,#FFFFFF_100%)]",
    sky: "border-sky-100 bg-[linear-gradient(180deg,#F4FAFF_0%,#FFFFFF_100%)]",
    emerald:
      "border-emerald-100 bg-[linear-gradient(180deg,#F3FFF8_0%,#FFFFFF_100%)]",
    rose: "border-rose-100 bg-[linear-gradient(180deg,#FFF5F6_0%,#FFFFFF_100%)]",
  };

  return (
    <div
      className={`rounded-[28px] border p-6 shadow-sm ${tones[tone] || tones.amber}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            {title}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <Icon size={20} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function FinancePanel({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 md:px-6">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}
