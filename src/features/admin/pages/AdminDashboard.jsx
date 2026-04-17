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
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of users, projects, reports, and recent moderation activity.
            </p>
          </div>

          {isRefreshing ? (
            <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              Refreshing...
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon="group"
        />

        <StatCard
          title="Banned Users"
          value={stats?.users?.banned || 0}
          icon="block"
        />

        <StatCard
          title="Total Projects"
          value={stats?.projects?.total || 0}
          icon="rocket"
        />

        <StatCard
          title="Total Reports"
          value={stats?.reports?.total || 0}
          icon="flag"
        />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-black text-slate-900">Recent Reports</h2>
          <p className="text-sm text-slate-500">
            Pending reports that still need moderation action.
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