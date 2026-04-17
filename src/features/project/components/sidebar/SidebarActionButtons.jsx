import { Heart, Share2, Flag, Lock } from "lucide-react";
import { ApplyVolunteerButton } from "@/features/volunteer/components/ApplyVolunteerButton";

export function SidebarActionButtons({
  isFunded,
  isFundingPhase,
  currentUserId,
  onDonateClick,
  onShare,
  onOpenReportModal,
  isReporting,
  project,
}) {
  const projectId = project?._id || project?.id;
  const projectName = project?.title || project?.name || "";

  return (
    <>
      <div className="mt-6 flex flex-col gap-4">
        {isFunded ? (
          isFundingPhase ? (
            <button
              type="button"
              onClick={onDonateClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] px-5 py-4 text-base font-black text-slate-900 shadow-[0_14px_30px_rgba(255,193,7,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(255,179,0,0.34)]"
            >
              <Heart className="h-5 w-5 fill-current" />
              Ủng hộ ngay
            </button>
          ) : (
            <button
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-base font-bold text-slate-400"
            >
              <Lock className="h-5 w-5" />
              Đã đóng gây quỹ
            </button>
          )
        ) : null}

        <ApplyVolunteerButton
          project={project}
          projectId={projectId}
          projectName={projectName}
          className="bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] text-slate-900 hover:bg-[linear-gradient(135deg,#FFCA28_0%,#FFB300_100%)] shadow-[0_14px_30px_rgba(255,193,7,0.28)] hover:shadow-[0_18px_36px_rgba(255,179,0,0.34)]"
        />
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onShare}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-500"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-[11px] font-bold">Chia sẻ</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            disabled={isReporting}
            className={`group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-slate-500 transition ${
              isReporting
                ? "cursor-not-allowed opacity-60"
                : "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
            }`}
          >
            <Flag className="h-5 w-5" />
            <span className="text-[11px] font-bold">Báo cáo</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default SidebarActionButtons;