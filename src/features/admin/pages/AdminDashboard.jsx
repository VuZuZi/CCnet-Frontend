import { useMemo, useState } from "react";
import {
  HeartHandshake,
  Landmark,
  MoveDownRight,
  MoveUpRight,
} from "lucide-react";

import StatCard from "../components/StatCard";
import ActivityTable from "../components/ActivityTable";
import ReportModal from "../components/ReportModal";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { getStatusLabel } from "@/shared/lib/statusLabels";

const getPendingReports = (reports) => {
  if (!Array.isArray(reports)) return [];
  return reports.filter(
    (report) => String(report?.status || "").toLowerCase() === "pending",
  );
};

const formatNumber = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("vi-VN");
};

const formatMoney = (value) => `${formatNumber(value)} đ`;

const AdminDashboard = () => {
  const {
    stats,
    reports,
    loading,
    handleResolveReport,
    updateProjectStatus,
    toggleBanUser,
  } = useAdminDashboard("overview");

  const [selectedReport, setSelectedReport] = useState(null);

  const pendingReports = useMemo(() => getPendingReports(reports), [reports]);
  const finance = stats?.finance || {};

  const totalInbound =
    Number(finance?.inbound?.projectDonations || 0) +
    Number(finance?.inbound?.supportDonations || 0);
  const totalOutbound = Number(finance?.outbound?.disbursements || 0);
  const netCashFlow = totalInbound - totalOutbound;

  const handleActionClick = (reportId) => {
    setSelectedReport(reportId);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  const handleSubmit = async (reportId, actions, note) => {
    await handleResolveReport(reportId, actions, note);
    setSelectedReport(null);
  };

  const totalUsers = stats?.users?.total || 0;
  const totalProjects = stats?.projects?.total || 0;
  const pendingRefunds =
    stats?.refunds?.byStatus?.find((item) => item._id === "PENDING")?.count || 0;

  return (
    <div className="mx-auto min-w-0 max-w-[1440px] space-y-7 lg:space-y-8">
      <section
        className="ccnet-auto-grid gap-4 lg:gap-5"
        style={{ "--ccnet-grid-min": "260px" }}
      >
        <StatCard title="Tổng người dùng" value={totalUsers} icon="group" />
        <StatCard title="Tổng số dự án" value={totalProjects} icon="rocket" />
        <StatCard
          title="Nguồn quỹ dự án hiện có"
          value={formatMoney(finance?.projectEscrowBalance || 0)}
          icon="wallet"
        />
        <StatCard
          title="Quỹ ủng hộ duy trì web"
          value={formatMoney(finance?.webSupportFundBalance || 0)}
          icon="refresh"
        />
        <StatCard
          title="Hoàn tiền chờ duyệt"
          value={pendingRefunds}
          icon="flag"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="overflow-hidden rounded-[30px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)] shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
          <div className="border-b border-amber-100 px-5 py-5 md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
                      Vận hành tài chính
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Tổng quan quỹ và giải ngân
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
                  Gom các dòng tiền chính về một chỗ để theo dõi tốc độ vào, ra và phần
                  chênh lệch đang còn trong hệ thống.
                </p>
              </div>

              <div className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-amber-800 shadow-sm">
                Dòng tiền trung tâm
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <FinanceSnapshotCard
                label="Tổng dòng tiền vào"
                value={formatMoney(totalInbound)}
                tone="emerald"
              />
              <FinanceSnapshotCard
                label="Tổng dòng tiền ra"
                value={formatMoney(totalOutbound)}
                tone="sky"
              />
              <FinanceSnapshotCard
                label="Chênh lệch thu chi"
                value={formatMoney(netCashFlow)}
                tone="slate"
              />
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
            <FinanceMiniCard
              icon={MoveDownRight}
              label="Đóng góp cho dự án"
              value={formatMoney(finance?.inbound?.projectDonations || 0)}
              tone="emerald"
            />
            <FinanceMiniCard
              icon={HeartIcon}
              label="Đóng góp cho quỹ duy trì web"
              value={formatMoney(finance?.inbound?.supportDonations || 0)}
              tone="amber"
            />
            <FinanceMiniCard
              icon={MoveUpRight}
              label="Đã giải ngân cho dự án"
              value={formatMoney(finance?.outbound?.disbursements || 0)}
              tone="sky"
            />
            <FinanceMiniCard
              icon={Landmark}
              label="Đang chờ giải ngân"
              value={formatMoney(finance?.pendingDisbursementAmount || 0)}
              tone="slate"
            />
          </div>
        </div>

        <DashboardListCard
          title="Giải ngân gần nhất"
          subtitle="Theo dõi các khoản chuyển tiền mới nhất để nắm tiến độ xử lý."
          items={finance?.recentDisbursements || []}
          renderItem={(item) => (
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
                    {formatMoney(item.approvedAmount || item.requestedAmount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Yêu cầu: {formatMoney(item.requestedAmount)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Ref: {item.bankTransactionRef || "Chưa chuyển"}
                </span>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                  {item.transferredAt
                    ? new Date(item.transferredAt).toLocaleString("vi-VN")
                    : "Chưa có thời điểm chuyển"}
                </span>
              </div>
            </div>
          )}
        />
      </section>

      <section className="min-w-0 overflow-hidden rounded-[30px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)] shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-amber-100 px-4 py-5 sm:px-5 md:px-6">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="ccnet-nowrap-label inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-amber-800">
                <span>Báo cáo chờ xử lý</span>
              </div>

              <h2 className="mt-3 text-xl font-black text-slate-900">
                Báo cáo gần đây
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Danh sách các báo cáo đang chờ xử lý để quản trị viên kiểm duyệt nhanh
                và chính xác hơn.
              </p>
            </div>

            <div
              className="ccnet-auto-grid w-full gap-3 lg:max-w-[390px]"
              style={{ "--ccnet-grid-min": "170px" }}
            >
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                  Chờ xử lý
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {formatNumber(pendingReports.length)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                  Trạng thái tải
                </p>
                <p className="mt-1 text-sm font-black text-amber-800">
                  {loading ? "Đang tải" : "Sẵn sàng"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-5">
          <div className="min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <ActivityTable
              activities={pendingReports}
              loading={loading}
              onAction={handleActionClick}
              onProjectStatusChange={updateProjectStatus}
              onUserBanToggle={toggleBanUser}
            />
          </div>
        </div>
      </section>

      <ReportModal
        isOpen={Boolean(selectedReport)}
        reportId={selectedReport}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

function HeartIcon(props) {
  return <HeartHandshake {...props} />;
}

function FinanceSnapshotCard({ label, value, tone = "emerald" }) {
  const toneMap = {
    amber: "border-amber-100 bg-amber-50/70 text-amber-900",
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-900",
    sky: "border-sky-100 bg-sky-50/70 text-sky-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${toneMap[tone] || toneMap.emerald}`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black leading-tight">{value}</p>
    </div>
  );
}

function FinanceMiniCard({ icon: Icon, label, value, tone = "amber" }) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={`rounded-[24px] border p-4 shadow-sm ${toneMap[tone] || toneMap.amber}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em]">
            {label}
          </p>
          <p className="mt-3 text-xl font-black leading-tight">{value}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-2.5">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function DashboardListCard({ title, subtitle, items, renderItem }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 md:px-6">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="space-y-4 p-5 md:p-6">
        {Array.isArray(items) && items.length > 0 ? (
          items.map(renderItem)
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
            Chưa có dữ liệu phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
