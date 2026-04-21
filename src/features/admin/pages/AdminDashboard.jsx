import { useMemo, useState } from "react";

import StatCard from "../components/StatCard";
import ActivityTable from "../components/ActivityTable";
import ReportModal from "../components/ReportModal";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

const getPendingReports = (reports) => {
  if (!Array.isArray(reports)) return [];
  return reports.filter(
    (report) => String(report?.status || "").toLowerCase() === "pending"
  );
};

const AdminDashboard = () => {
  const {
    stats,
    reports,
    loading,
    handleResolveReport,
    updateProjectStatus,
    toggleBanUser,
    isStatsFetching,
    isReportsFetching,
  } = useAdminDashboard("overview");

  const [selectedReport, setSelectedReport] = useState(null);

  const pendingReports = useMemo(() => getPendingReports(reports), [reports]);

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

  const isRefreshing = isStatsFetching || isReportsFetching;

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Bảng điều khiển Quản trị
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tổng quan về người dùng, dự án, báo cáo và hoạt động kiểm duyệt gần đây.
            </p>
          </div>

          {isRefreshing ? (
            <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              Đang làm mới...
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng người dùng"
          value={stats?.users?.total || 0}
          icon="group"
        />

        <StatCard
          title="Người dùng bị khóa"
          value={stats?.users?.banned || 0}
          icon="block"
        />

        <StatCard
          title="Tổng số dự án"
          value={stats?.projects?.total || 0}
          icon="rocket"
        />

        <StatCard
          title="Tổng số báo cáo"
          value={stats?.reports?.total || 0}
          icon="flag"
        />

        <StatCard
          title="Số dư ví tổng (tất cả dự án)"
          value={`${Number(stats?.finance?.globalProjectWalletBalance || 0).toLocaleString('vi-VN')} đ`}
          icon="wallet"
        />

        <StatCard
          title="Yêu cầu hoàn tiền chờ duyệt"
          value={
            stats?.refunds?.byStatus?.find((item) => item._id === 'PENDING')?.count ||
            0
          }
          icon="refresh"
        />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-black text-slate-900">Báo cáo gần đây</h2>
          <p className="text-sm text-slate-500">
            Các báo cáo đang chờ xử lý cần được kiểm duyệt.
          </p>
        </div>

        <ActivityTable
          activities={pendingReports}
          loading={loading}
          onAction={handleActionClick}
          onProjectStatusChange={updateProjectStatus}
          onUserBanToggle={toggleBanUser}
        />
      </div>

      <ReportModal
        isOpen={Boolean(selectedReport)}
        reportId={selectedReport}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminDashboard;