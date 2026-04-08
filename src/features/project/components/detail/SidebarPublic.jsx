import { useState } from "react";
import {
  Heart,
  Share2,
  Flag,
  Sparkles,
  Users,
  Wallet,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { ApplyVolunteerButton } from "@/features/volunteer/components/ApplyVolunteerButton";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useFollowMutations } from "@/features/community/hooks/useFollow";
import { useReportProject } from "@/features/project/hooks/useProjectMutations.js";
import { useToast } from "@/shared/contexts/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function SidebarPublic({ project }) {
  const currentAmount = project?.currentAmount || 0;
  const targetAmount = project?.targetAmount || 1;
  const progressPercent = Math.min(
    Math.round((currentAmount / targetAmount) * 100),
    100,
  );

  const user = useAuthStore(authSelectors.user);
  const { follow, unfollow } = useFollowMutations();
  const queryClient = useQueryClient();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState(null);

  const reportReasons = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "inappropriate", label: "Inappropriate" },
    { value: "violence", label: "Violence" },
    { value: "hate_speech", label: "Hate speech" },
    { value: "other", label: "Other" },
  ];

  const organizer = project?.organizerId;
  const organizerId = organizer?._id || organizer;
  const currentUserId = user?.id || user?.userId;
  const isFollowingOrg = Boolean(project?.isFollowingOrganizer);

  const { mutateAsync: reportProject, isPending: isReporting } = useReportProject();
  const toast = useToast();

  const handleToggleFollowOrg = () => {
    if (!organizerId) return;

    if (isFollowingOrg) {
      unfollow.mutate(organizerId, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["project", project?._id || project?.id],
          });
        },
      });
      return;
    }

    follow.mutate(organizerId, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["project", project?._id || project?.id],
        });
      },
    });
  };

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

      {organizer && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={organizer?.avatar || "https://ui-avatars.com/api/?name=Org"}
              alt="Organizer"
              className="h-10 w-10 rounded-full border border-gray-200 object-cover"
            />

            <div className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900">
                {organizer?.fullName || "Tổ chức / Cá nhân"}
              </span>
              <span className="text-xs font-medium text-slate-500">Chủ dự án</span>
            </div>
          </div>

          {currentUserId !== organizerId && (
            <button
              type="button"
              onClick={handleToggleFollowOrg}
              disabled={follow.isPending || unfollow.isPending}
              className={`ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${isFollowingOrg
                ? "border-slate-200 bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                } ${(follow.isPending || unfollow.isPending) ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {isFollowingOrg ? (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  Đã theo dõi
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  Theo dõi
                </>
              )}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FBBF24_0%,#F59E0B_100%)] px-5 py-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(251,191,36,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(245,158,11,0.32)]"
        >
          <Heart className="h-5 w-5 fill-current" />
          Donate Now
        </button>

        <ApplyVolunteerButton
          user={user}
          projectId={project?._id || project?.id}
          projectName={project?.name || project?.title}
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

          <button
            type="button"
            onClick={() => {
              if (!user?.id) {
                toast.error('Vui lòng đăng nhập để báo cáo dự án');
                return;
              }
              setReportError(null);
              setReportModalOpen(true);
            }}
            disabled={isReporting}
            className={`group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-slate-500 transition ${isReporting ? 'opacity-60 cursor-not-allowed' : 'hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600'
              }`}
          >
            <Flag className="h-5 w-5" />
            <span className="text-[11px] font-bold">Report</span>
          </button>
        </div>
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Báo cáo dự án</h3>
                <p className="text-sm text-slate-500">Gửi báo cáo đến quản trị viên để kiểm duyệt.</p>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="text-2xl font-bold text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form
              className="space-y-4 px-6 py-5"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!reportReason) {
                  setReportError('Vui lòng chọn lý do báo cáo');
                  return;
                }

                try {
                  await reportProject({
                    projectId: project?._id || project?.id,
                    payload: {
                      reason_code: reportReason,
                      description: reportDescription.trim(),
                    },
                  });
                  setReportModalOpen(false);
                  setReportReason("");
                  setReportDescription("");
                  setReportError(null);
                } catch (error) {
                  setReportError(error.response?.data?.message || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
                  console.error('Project report failed', error);
                }
              }}
            >
              {reportError && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {reportError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Lý do báo cáo</label>
                <select
                  value={reportReason}
                  onChange={(e) => {
                    setReportReason(e.target.value);
                    setReportError(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="">Chọn lý do</option>
                  {reportReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả thêm (tùy chọn)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                  placeholder="Bạn có thể mô tả chi tiết hơn về vấn đề"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isReporting}
                  className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReporting ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SidebarPublic;