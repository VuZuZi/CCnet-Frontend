import { useRef } from 'react';
import { ShieldCheck, Users, Lock, Edit, MessageSquare, Sparkles, Wallet } from 'lucide-react';
import { useVolunteerQueries } from '@/features/volunteer/hooks/useVolunteerQueries';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export function SidebarOrganizer({ project, onNavigateToVolunteerTab }) {
  const isVolunteerOnly = project?.projectType === 'VOLUNTEER_ONLY';
  const isFunded = project?.projectType === 'FUNDED' || !project?.projectType;

  const availableBalance = project?.financialDetail?.availableBalance ?? project?.currentAmount ?? 0;
  const targetAmount = project?.targetAmount ?? 1;
  const pendingRefunds = project?.financialDetail?.pendingRefunds ?? 0;
  const progressPercent = Math.min(Math.round((availableBalance / targetAmount) * 100), 100);

  const projectId = project?._id;
  const pendingCountRef = useRef(null);

  const { useProjectPendingApplications } = useVolunteerQueries();
  const { data: pendingData, isLoading } = useProjectPendingApplications(projectId);

  const getPendingCount = () => {
    if (!pendingData) return 0;
    if (pendingData?.data?.data && Array.isArray(pendingData.data.data)) return pendingData.data.data.length;
    if (pendingData?.data && Array.isArray(pendingData.data)) return pendingData.data.length;
    if (Array.isArray(pendingData)) return pendingData.length;
    if (pendingData?.data?.total) return pendingData.data.total;
    return 0;
  };

  const pendingAppsCount = getPendingCount();

  const handlePendingVolunteersClick = () => {
    if (pendingCountRef.current) {
      pendingCountRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pendingCountRef.current.classList.add('ring-4', 'ring-[#FBBF24]/30', 'scale-110');
      setTimeout(() => {
        if (pendingCountRef.current) {
          pendingCountRef.current.classList.remove('ring-4', 'ring-[#FBBF24]/30', 'scale-110');
        }
      }, 1000);
    }
    if (onNavigateToVolunteerTab) {
      onNavigateToVolunteerTab('volunteer', 'pending');
    }
  };

  return (
    <div className="sticky top-28 flex flex-col gap-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/25 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
            <Sparkles size={11} />
            Organizer Mode
          </div>
          <h2 className="text-lg font-bold text-slate-900">Command Center</h2>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-white shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Admin View</span>
        </div>
      </div>

      <div className="space-y-4">
        {isFunded && (
          <>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                Funds in Escrow
              </p>
              <div className="mt-2 flex items-end gap-3">
                <div className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {formatCurrency(availableBalance)}đ
                </div>
              </div>
              {pendingRefunds > 0 && (
                <p className="mt-1 text-xs font-medium text-amber-600">
                  ({formatCurrency(pendingRefunds)}đ đang chờ Kế toán hoàn trả)
                </p>
              )}
              <p className="mt-1 text-sm text-slate-500">Goal: {formatCurrency(targetAmount)}đ</p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="relative h-full rounded-full bg-[linear-gradient(90deg,#C084FC_0%,#A855F7_100%)] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        )}

        <div className={`grid ${isFunded ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {isFunded && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                <Wallet size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{progressPercent}%</p>
              <p className="mt-1 text-sm font-medium text-slate-500">Funded</p>
            </div>
          )}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Users size={18} />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{pendingAppsCount}</p>
            <p className="mt-1 text-sm font-medium text-emerald-600">Pending</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[24px] border border-emerald-100 bg-emerald-50/80 p-4 transition hover:border-emerald-200 hover:bg-emerald-50">
        <div className="group flex cursor-pointer items-center gap-3" onClick={handlePendingVolunteersClick}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm transition group-hover:scale-105">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">Pending Volunteers</p>
            <p className="text-xs text-emerald-700">Review applications</p>
          </div>
        </div>
        <div ref={pendingCountRef} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-md transition-all duration-300">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            pendingAppsCount
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        {isFunded && (
          <>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-sm font-bold text-slate-500">
              <Lock className="h-5 w-5" />
              Request Disbursement
            </button>
            <p className="text-center text-xs text-slate-500">
              Submit Phase 1 evidence to unlock.
            </p>
            <div className="my-1 border-t border-slate-100" />
          </>
        )}

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
          <Edit className="h-4 w-4" />
          Edit Project Details
        </button>
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
          <MessageSquare className="h-4 w-4" />
          Open Project Group Chat
        </button>
      </div>
    </div>
  );
}

export default SidebarOrganizer;