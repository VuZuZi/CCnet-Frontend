import { useState } from "react";

import StatCard from "../components/StatCard";
import ActivityTable from "../components/ActivityTable";
import ReportModal from "../components/ReportModal";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

const AdminDashboard = () => {
  const { stats, reports, loading, handleResolveReport } =
    useAdminDashboard("overview");

  const [selectedReport, setSelectedReport] = useState(null);

  const handleActionClick = (reportId) => {
    setSelectedReport(reportId);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          value={stats?.projects || 0}
          icon="rocket"
        />

        <StatCard
          title="Total Reports"
          value={stats?.reports || 0}
          icon="flag"
        />
      </div>

      {/* REPORT TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>

        <ActivityTable
          activities={reports}
          loading={loading}
          onAction={handleActionClick}
        />
      </div>

      {/* REPORT RESOLVE MODAL */}
      <ReportModal
        isOpen={!!selectedReport}
        reportId={selectedReport}
        onClose={closeModal}
        onSubmit={handleResolveReport}
      />
    </div>
  );
};

export default AdminDashboard;
