import {
  ShieldCheck,
  Users,
  Sparkles,
  Wallet,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVolunteerQueries } from '@/features/volunteer/hooks/useVolunteerQueries';
import { getProjectFundingStats, getProjectMode } from '@/features/project/utils/projectDisplay.utils';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export function SidebarOrganizer({
  project,
  projectConversation,
  onOpenProjectGroup,
  onManageVolunteers,
}) {
  const { isFundedProject, isVolunteerOnly } = getProjectMode(project);
  const { targetAmount, fundingPercent } = getProjectFundingStats(project);


  const availableBalance = Number(project?.financialDetail?.availableBalance ?? 0);
  const pendingDisbursement = Number(project?.financialDetail?.pendingDisbursement ?? 0);
  const escrowBalance = project?.financialDetail?.escrowBalance ?? (availableBalance + pendingDisbursement);
  const pendingRefunds = project?.financialDetail?.pendingRefunds ?? 0;

  const projectId = project?._id;

  const { useProjectPendingApplications } = useVolunteerQueries();
  const { data: pendingData, isLoading } = useProjectPendingApplications(projectId);


  const pendingAppsCount = Array.isArray(pendingData)
    ? pendingData.length
    : (pendingData?.total || pendingData?.totalItems || 0);

  const hasProjectGroup = Boolean(projectConversation?._id);
  const isUpdating = String(project?.status || '').toUpperCase() === 'UPDATING';

  return (
    <div className="flex flex-col gap-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/25 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
            <Sparkles size={11} />
            Chế độ nhà tổ chức
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Quản lý dự án</h2>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi volunteer và thao tác nhanh theo vai trò organizer.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-white shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Nhà tổ chức
          </span>
        </div>
      </div>

      {isFundedProject ? (
        <div className="rounded-[26px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFBEB_100%)] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">
            Quỹ đang ký quỹ
          </p>

          <div className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            {formatCurrency(escrowBalance)}đ
          </div>

          {pendingRefunds > 0 ? (
            <p className="mt-1 text-xs font-medium text-amber-700">
              {formatCurrency(pendingRefunds)}đ đang chờ hoàn trả
            </p>
          ) : null}

          <p className="mt-1 text-sm text-slate-500">
            Goal: {formatCurrency(targetAmount)}đ
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] transition-all duration-1000"
              style={{ width: `${fundingPercent}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEB] text-amber-700 shadow-sm">
                <Wallet size={18} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {fundingPercent}%
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">Đã gọi vốn</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                <Users size={18} />
              </div>
              <p className="text-2xl font-extrabold text-amber-700">
                {isLoading ? '...' : pendingAppsCount}
              </p>
              <p className="mt-1 text-sm font-medium text-amber-700">
                Đơn chờ duyệt
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isVolunteerOnly ? (
        <div className="rounded-[26px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFBEB_100%)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">
                Tổng quan tình nguyện
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                {isLoading ? '...' : pendingAppsCount}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Đơn tình nguyện đang chờ organizer xử lý
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      ) : null}

      {isUpdating ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-black text-amber-900">Yêu cầu cập nhật từ quản trị viên</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-800">
            {project?.updateRequestReason || 'Vui lòng rà soát lại mốc hoạt động của dự án.'}
          </p>

          <Link
            to={`/projects/${projectId}/updating`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-amber-600"
          >
            Cập nhật mốc hoạt động
          </Link>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">Đơn tình nguyện</p>
          <p className="mt-1 text-xs text-slate-500">
            Xem nhanh các đơn đang chờ duyệt và quản lý tình nguyện viên của dự án.
          </p>
        </div>

        <button
          type="button"
          onClick={onManageVolunteers}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-[#FFFBEB] px-5 py-3.5 text-sm font-bold text-amber-900 transition hover:border-amber-300 hover:bg-amber-100"
        >
          <Users className="h-4 w-4" />
          {isLoading ? 'Đang tải...' : `Quản lý tình nguyện viên${pendingAppsCount > 0 ? ` (${pendingAppsCount})` : ''}`}
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">Nhóm dự án</p>
          <p className="mt-1 text-xs text-slate-500">
            Mở nhanh group chat của dự án để trao đổi với volunteer.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProjectGroup}
          disabled={!hasProjectGroup}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition ${hasProjectGroup
            ? 'border border-amber-200 bg-[#FFFBEB] text-amber-900 hover:border-amber-300 hover:bg-amber-100'
            : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
            }`}
        >
          <MessageSquare className="h-4 w-4" />
          {hasProjectGroup ? 'Mở nhóm dự án' : 'Chưa có nhóm dự án'}
        </button>
      </div>
    </div>
  );
}

export default SidebarOrganizer;