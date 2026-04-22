import {
  BadgeCheck,
  CalendarDays,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Clock3,
  Send,
} from "lucide-react";
import { ApplyVolunteerButton } from "@/features/volunteer/components/ApplyVolunteerButton";
import { getProjectFundingStats } from "@/features/project/utils/projectDisplay.utils";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDateRange(startDate, endDate) {
  const formatValue = (value) => {
    if (!value) return "--/--/----";

    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return "--/--/----";
    }
  };

  return `${formatValue(startDate)} - ${formatValue(endDate)}`;
}

function getVolunteerStatusMeta(status) {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "WITHDRAW_REQUESTED":
      return {
        badgeClass: "bg-amber-100 text-amber-800",
        panelClass:
          "border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFBEB_100%)]",
        iconClass: "bg-white text-amber-700",
        label: "Äang chá» duyá»‡t rÃºt",
        description:
          "Báº¡n Ä‘Ã£ gá»­i yÃªu cáº§u xin rÃºt khá»i dá»± Ã¡n. HÃ£y chá» ngÆ°á»i tá»• chá»©c pháº£n há»“i.",
      };

    case "APPROVED":
    default:
      return {
        badgeClass: "bg-emerald-100 text-emerald-800",
        panelClass:
          "border-emerald-100 bg-[linear-gradient(180deg,#F7FFF9_0%,#ECFDF3_100%)]",
        iconClass: "bg-white text-emerald-700",
        label: "ThÃ nh viÃªn Ä‘ang hoáº¡t Ä‘á»™ng",
        description:
          "Báº¡n Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t vÃ  Ä‘ang lÃ  tÃ¬nh nguyá»‡n viÃªn cá»§a dá»± Ã¡n nÃ y.",
      };
  }
}

export function SidebarVolunteer({
  project,
  projectConversation,
  onOpenProjectGroup,
  onOpenCommunityTab,
  onOpenFinancialsTab,
  applicationStatus,
  isCheckingApplication = false,
}) {
  const isFunded = project?.projectType === "FUNDED" || !project?.projectType;

  const availableBalance = Number(project?.financialDetail?.availableBalance ?? 0);
  const pendingDisbursement = Number(project?.financialDetail?.pendingDisbursement ?? 0);
  const escrowBalance =
    project?.financialDetail?.escrowBalance ??
    availableBalance + pendingDisbursement;
  const { raisedAmount, targetAmount, fundingPercent } = getProjectFundingStats(project);
  const progressPercent = fundingPercent;

  const currentVolunteers = Number(project?.stats?.currentVolunteers || 0);
  const targetVolunteers = Number(project?.stats?.targetVolunteers || 0);

  const hasProjectGroup = Boolean(projectConversation?._id);
  const statusMeta = getVolunteerStatusMeta(applicationStatus);

  return (
    <div className="flex flex-col gap-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            <Sparkles size={11} />
            Cháº¿ Ä‘á»™ tÃ¬nh nguyá»‡n viÃªn
          </div>

          <h2 className="text-lg font-extrabold text-slate-900">
            Báº¡n Ä‘ang tham gia dá»± Ã¡n
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Theo dÃµi tiáº¿n Ä‘á»™ dá»± Ã¡n vÃ  má»Ÿ nhanh cÃ¡c thao tÃ¡c dÃ nh cho tÃ¬nh nguyá»‡n
            viÃªn.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-white shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
            ThÃ nh viÃªn
          </span>
        </div>
      </div>

      <div className={`rounded-[26px] border p-5 ${statusMeta.panelClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
              Tráº¡ng thÃ¡i tham gia
            </p>

            <div
              className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-extrabold shadow-sm ${statusMeta.badgeClass}`}
            >
              {applicationStatus === "WITHDRAW_REQUESTED" ? (
                <Clock3 className="h-4 w-4" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}
              {statusMeta.label}
            </div>

            <p className="mt-3 text-sm text-slate-600">
              {statusMeta.description}
            </p>

            {isCheckingApplication ? (
              <p className="mt-2 text-xs text-slate-500">
                Äang Ä‘á»“ng bá»™ tráº¡ng thÃ¡i tham gia...
              </p>
            ) : null}
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${statusMeta.iconClass}`}
          >
            {applicationStatus === "WITHDRAW_REQUESTED" ? (
              <Send className="h-6 w-6" />
            ) : (
              <HeartHandshake className="h-6 w-6" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            <CalendarDays className="h-4 w-4" />
            Thá»i gian
          </div>
          <p className="text-sm font-bold text-slate-900">
            {formatDateRange(project?.startDate, project?.endDate)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            <Users className="h-4 w-4" />
            TÃ¬nh nguyá»‡n viÃªn
          </div>
          <p className="text-sm font-bold text-slate-900">
            {currentVolunteers}
            {targetVolunteers > 0 ? ` / ${targetVolunteers}` : ""} thÃ nh viÃªn
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">HÃ nh Ä‘á»™ng cá»§a báº¡n</p>
          <p className="mt-1 text-xs text-slate-500">
            Quáº£n lÃ½ tráº¡ng thÃ¡i tham gia hoáº·c gá»­i yÃªu cáº§u xin rÃºt khá»i dá»± Ã¡n.
          </p>
        </div>

        <ApplyVolunteerButton
          project={project}
          projectId={project?._id || project?.id}
          projectName={project?.title || project?.name || ""}
          className="bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] text-slate-900 hover:bg-[linear-gradient(135deg,#FFCA28_0%,#FFB300_100%)] shadow-[0_14px_30px_rgba(255,193,7,0.28)] hover:shadow-[0_18px_36px_rgba(255,179,0,0.34)]"
        />
      </div>

      {isFunded ? (
        <div className="rounded-[26px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFBEB_100%)] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">
            Quá»¹ Ä‘ang Ä‘Æ°á»£c giá»¯
          </p>

          <div className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            {formatCurrency(escrowBalance)}Ä‘
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Má»¥c tiÃªu: {formatCurrency(targetAmount)}Ä‘
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenFinancialsTab}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-[#FFFBEB] px-5 py-3.5 text-sm font-bold text-amber-900 transition hover:border-amber-300 hover:bg-amber-100"
            >
              <Wallet className="h-4 w-4" />
              Xem tiáº¿n Ä‘á»™ tÃ i chÃ­nh
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">NhÃ³m dá»± Ã¡n</p>
          <p className="mt-1 text-xs text-slate-500">
            Trao Ä‘á»•i vá»›i ngÆ°á»i tá»• chá»©c vÃ  cÃ¡c tÃ¬nh nguyá»‡n viÃªn khÃ¡c trong nhÃ³m
            chat.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProjectGroup}
          disabled={!hasProjectGroup}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition ${
            hasProjectGroup
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
              : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          {hasProjectGroup ? "Má»Ÿ nhÃ³m dá»± Ã¡n" : "ChÆ°a cÃ³ nhÃ³m dá»± Ã¡n"}
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">Cá»™ng Ä‘á»“ng dá»± Ã¡n</p>
          <p className="mt-1 text-xs text-slate-500">
            Theo dÃµi cáº­p nháº­t má»›i, bÃ i Ä‘Äƒng vÃ  tÆ°Æ¡ng tÃ¡c trong cá»™ng Ä‘á»“ng dá»± Ã¡n.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCommunityTab}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
        >
          <Users className="h-4 w-4" />
          Má»Ÿ tab cá»™ng Ä‘á»“ng
        </button>
      </div>
    </div>
  );
}

export default SidebarVolunteer;

