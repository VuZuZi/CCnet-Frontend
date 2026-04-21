import { useMemo, useState } from "react";
import { Activity, Flag, ShieldAlert, Sparkles } from "lucide-react";

import StatCard from "../components/StatCard";
import ActivityTable from "../components/ActivityTable";
import ReportModal from "../components/ReportModal";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

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

  const totalUsers = stats?.users?.total || 0;
  const bannedUsers = stats?.users?.banned || 0;
  const totalProjects = stats?.projects?.total || 0;
  const totalReports = stats?.reports?.total || 0;
  const totalWalletBalance = stats?.finance?.globalProjectWalletBalance || 0;
  const pendingRefunds =
    stats?.refunds?.byStatus?.find((item) => item._id === "PENDING")?.count || 0;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-amber-100 bg-[linear-gradient(135deg,#FFFDF7_0%,#FFF8E7_45%,#FFFFFF_100%)] shadow-[0_18px_50px_rgba(251,191,36,0.12)]">
        <div className="grid gap-6 px-5 py-5 md:px-7 md:py-7 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-amber-800 shadow-sm">
              <Sparkles size={14} />
              Admin Overview
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Bảng điều khiển quản trị
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-[15px]">
              Theo dõi nhanh tình trạng người dùng, dự án, báo cáo và các hoạt động
              kiểm duyệt gần đây trong một giao diện gọn gàng, hiện đại và đồng bộ
              với hệ thống quản trị.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
                <Flag size={16} />
                {formatNumber(pendingReports.length)} báo cáo chờ xử lý
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                <Activity size={16} />
                {formatNumber(totalProjects)} dự án đang được quản lý
              </div>

              {isRefreshing ? (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-amber-800 shadow-sm">
                  <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[#FBBF24]" />
                  Đang làm mới dữ liệu...
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-[#FBBF24]">
                  <ShieldAlert size={22} strokeWidth={2.2} />
                </div>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
                    Trọng tâm hôm nay
                  </p>
                  <p className="mt-1 text-base font-black text-slate-900">
                    Kiểm duyệt báo cáo
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Ưu tiên xử lý các báo cáo đang chờ để đảm bảo hệ thống vận hành ổn
                định và minh bạch.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
                Tổng báo cáo
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {formatNumber(totalReports)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Bao gồm tất cả báo cáo trong hệ thống.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
                Hoàn tiền chờ duyệt
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {formatNumber(pendingRefunds)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Các yêu cầu cần được xem xét trong bước tiếp theo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Tổng người dùng"
          value={totalUsers}
          icon="group"
        />

        <StatCard
          title="Người dùng bị khóa"
          value={bannedUsers}
          icon="block"
        />

        <StatCard
          title="Tổng số dự án"
          value={totalProjects}
          icon="rocket"
        />

        <StatCard
          title="Tổng số báo cáo"
          value={totalReports}
          icon="flag"
        />

        <StatCard
          title="Số dư ví tổng"
          value={`${formatNumber(totalWalletBalance)} đ`}
          icon="wallet"
        />

        <StatCard
          title="Hoàn tiền chờ duyệt"
          value={pendingRefunds}
          icon="refresh"
        />
      </section>

      <section className="overflow-hidden rounded-[32px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)] shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-amber-100 px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-amber-800">
                <Flag size={13} />
                Moderation Queue
              </div>

              <h2 className="mt-3 text-xl font-black text-slate-900">
                Báo cáo gần đây
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Danh sách các báo cáo đang chờ xử lý để quản trị viên kiểm duyệt
                nhanh và chính xác hơn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
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

        <div className="p-4 md:p-6">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
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

export default AdminDashboard;