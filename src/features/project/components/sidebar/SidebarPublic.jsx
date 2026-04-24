import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { DonateModal } from "@/features/transaction/components/DonateModal";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useFollowMutations } from "@/features/Community/hooks/useFollow";
import { useReportProject } from "@/features/project/hooks/useProjectMutations.js";
import { PROJECT_QUERY_KEYS } from "@/features/project/hooks/useProjectQueries";
import { useToast } from "@/shared/contexts/ToastContext";

import SidebarStatsCard from "./SidebarStatsCard";
import SidebarOrganizerCard from "./SidebarOrganizerCard";
import SidebarActionButtons from "./SidebarActionButtons";
import ProjectReportModal from "./ProjectReportModal";
import {
  getSidebarProjectStats,
  normalizeSidebarProjectId,
} from "./utils/projectSidebar.utils";

export function SidebarPublic({ project }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore(authSelectors.user);
  const { follow, unfollow } = useFollowMutations();
  const { mutateAsync: reportProject, isPending: isReporting } = useReportProject();

  const location = useLocation();
  const navigate = useNavigate();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState("");
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  const projectId = normalizeSidebarProjectId(project?._id || project?.id);
  const organizer = project?.organizerId;
  const organizerId = normalizeSidebarProjectId(organizer);
  const currentUserId = normalizeSidebarProjectId(
    user?._id || user?.id || user?.userId,
  );
  const isFollowingOrg = Boolean(project?.isFollowingOrganizer);

  const {
    isVolunteerOnly,
    isFunded,
    isFundingPhase,
    availableBalance,
    targetAmount,
    pendingRefunds,
    progressPercent,
    currentVolunteers,
    targetVolunteers,
    volunteerPercent,
  } = useMemo(() => getSidebarProjectStats(project), [project]);

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
    title: project?.title || "Dự án",
          text: "Xem dự án này trên CCNet",
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã sao chép link dự án.");
    } catch {
      toast.error("Không thể chia sẻ lúc này. Vui lòng thử lại.");
    }
  };

  const handleToggleFollowOrg = () => {
    if (!organizerId || !currentUserId || organizerId === currentUserId) return;

    const mutation = isFollowingOrg ? unfollow : follow;

    mutation.mutate(organizerId, {
      onSuccess: () => {
        if (projectId) {
          queryClient.invalidateQueries({
            queryKey: PROJECT_QUERY_KEYS.detail(projectId),
          });
        }
      },
    });
  };

  const handleDonateClick = () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để ủng hộ dự án");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!isFundingPhase) {
      toast.info("Dự án hiện không ở giai đoạn nhận đóng góp.");
      return;
    }

    const remainingAmount = Math.max(Number(targetAmount || 0) - Number(availableBalance || 0), 0);
    if (remainingAmount <= 0) {
      toast.info("Dự án đã đạt đủ mục tiêu gây quỹ.");
      return;
    }

    setIsDonateOpen(true);
  };

  const handleOpenReportModal = () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để báo cáo dự án");
      return;
    }

    setReportError("");
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (event) => {
    event.preventDefault();

    if (!reportReason) {
      setReportError("Vui lòng chọn lý do báo cáo");
      return;
    }

    try {
      await reportProject({
        projectId,
        payload: {
          reason_code: reportReason,
          description: reportDescription.trim(),
        },
      });

      setReportModalOpen(false);
      setReportReason("");
      setReportDescription("");
      setReportError("");
    } catch (error) {
      setReportError(
        error?.response?.data?.message || "Gửi báo cáo thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-7">
      <SidebarStatsCard
        isFunded={isFunded}
        isVolunteerOnly={isVolunteerOnly}
        availableBalance={availableBalance}
        targetAmount={targetAmount}
        pendingRefunds={pendingRefunds}
        progressPercent={progressPercent}
        currentVolunteers={currentVolunteers}
        targetVolunteers={targetVolunteers}
        volunteerPercent={volunteerPercent}
      />

      <SidebarOrganizerCard
        organizer={organizer}
        organizerId={organizerId}
        currentUserId={currentUserId}
        isFollowingOrg={isFollowingOrg}
        follow={follow}
        unfollow={unfollow}
        onToggleFollowOrg={handleToggleFollowOrg}
      />

      <SidebarActionButtons
        isFunded={isFunded}
        isFundingPhase={isFundingPhase}
        currentUserId={currentUserId}
        onDonateClick={handleDonateClick}
        onShare={handleShare}
        onOpenReportModal={handleOpenReportModal}
        isReporting={isReporting}
        project={project}
      />

      <ProjectReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportReason={reportReason}
        setReportReason={(value) => {
          setReportReason(value);
          setReportError("");
        }}
        reportDescription={reportDescription}
        setReportDescription={setReportDescription}
        reportError={reportError}
        onSubmit={handleSubmitReport}
        isReporting={isReporting}
      />

      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        projectId={projectId}
        projectTitle={project?.title || project?.name}
        projectStatus={project?.status}
        currentFundedAmount={availableBalance}
        targetAmount={targetAmount}
      />
    </div>
  );
}

export default SidebarPublic;
