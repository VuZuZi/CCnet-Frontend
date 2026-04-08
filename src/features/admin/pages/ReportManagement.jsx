import { useAdminDashboard } from "../hooks/useAdminDashboard";
import ActivityTable from "../components/ActivityTable";

const ReportManagement = () => {
  const {
    reports,
    loading,
    handleResolveReport,
    updateProjectStatus,
    toggleBanUser,
  } = useAdminDashboard("reports");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports & Logs</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <ActivityTable
          activities={reports}
          loading={loading}
          onAction={(id) => handleResolveReport(id)}
          onProjectStatusChange={updateProjectStatus}
          onUserBanToggle={toggleBanUser}
        />
      </div>
    </div>
  );
};

export default ReportManagement;
