import { useState } from "react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import ActivityTable from "../components/ActivityTable";
import ReportModal from "../components/ReportModal";

const ReportManagement = () => {
  const {
    reports,
    loading,
    handleResolveReport,
    updateProjectStatus,
    toggleBanUser,
    isReportsFetching,
  } = useAdminDashboard("reports");

  const [selectedReport, setSelectedReport] = useState(null);

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

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Báo cáo & Nhật ký
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Xem xét báo cáo của người dùng, kiểm duyệt nội dung và thực hiện hành động với các ghi chú kiểm tra rõ ràng.
            </p>
          </div>

          {isReportsFetching ? (
            <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              Đang làm mới...
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <ActivityTable
          activities={reports}
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

export default ReportManagement;