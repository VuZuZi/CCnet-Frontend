import { Heart, Share2, Flag, Sparkles, Users, Wallet } from 'lucide-react';
import { ApplyVolunteerButton } from '@/features/volunteer/components/ApplyVolunteerButton';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export function SidebarPublic({ project }) {
  const currentAmount = project?.currentAmount || 0;
  const targetAmount = project?.targetAmount || 1;
  const progressPercent = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  const user = useAuthStore(authSelectors.user);

  return (
    <div className="sticky top-28 flex flex-col gap-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/25 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
            <Sparkles size={11} />
            Public Support
          </div>
          <h3 className="text-lg font-bold text-slate-900">Support this project</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Funds raised
          </p>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {formatCurrency(currentAmount)}đ
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Goal: {formatCurrency(targetAmount)}đ
          </p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="relative h-full rounded-full bg-[linear-gradient(90deg,#FBBF24_0%,#F59E0B_100%)] transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
              <Wallet size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{progressPercent}%</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Funded</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <Users size={18} />
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {project?.stats?.currentVolunteers?.toLocaleString() || 0}
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-600">Volunteers</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FBBF24_0%,#F59E0B_100%)] px-5 py-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(251,191,36,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(245,158,11,0.32)]">
          <Heart className="h-5 w-5 fill-current" />
          Donate Now
        </button>

        <ApplyVolunteerButton
          user={user}
          projectId={project?._id || project?.id}
          projectName={project?.name}
        />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <div className="grid grid-cols-3 gap-3">
          <button className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500">
            <Heart className="h-5 w-5" />
            <span className="text-[11px] font-bold">Follow</span>
          </button>

          <button className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-500">
            <Share2 className="h-5 w-5" />
            <span className="text-[11px] font-bold">Share</span>
          </button>

          <button className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600">
            <Flag className="h-5 w-5" />
            <span className="text-[11px] font-bold">Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SidebarPublic;