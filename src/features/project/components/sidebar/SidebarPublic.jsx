import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import { DonateModal } from "@/features/transaction/components/DonateModal";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useFollowMutations } from "@/features/Community/hooks/useFollow";
import { useReportProject } from "@/features/project/hooks/useProjectMutations.js";
import { PROJECT_QUERY_KEYS } from "@/features/project/hooks/useProjectQueries";
import { useToast } from "@/shared/contexts/ToastContext";

import PostForm from "@/features/Community/components/post/PostForm";

import SidebarStatsCard from "./SidebarStatsCard";
import SidebarOrganizerCard from "./SidebarOrganizerCard";
import SidebarActionButtons from "./SidebarActionButtons";
import ProjectReportModal from "./ProjectReportModal";
import {
  getSidebarProjectStats,
  normalizeSidebarProjectId,
} from "./utils/projectSidebar.utils";

const stripHtml = (value = "") => {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getTextValue = (value, fallback = "") => {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    return (
      value.fullAddress ||
      value.address ||
      value.name ||
      value.formattedAddress ||
      value.province ||
      value.city ||
      value.district ||
      fallback
    );
  }

  return fallback;
};

const getProjectThumbnail = (project) => {
  const imageCandidate =
    project?.coverMedia?.url ||
    project?.coverMedia?.secure_url ||
    project?.coverMedia?.src ||
    project?.coverMedia?.path ||
    project?.coverMedia?.[0]?.url ||
    project?.coverMedia?.[0]?.secure_url ||
    project?.coverMedia?.[0]?.src ||
    project?.coverMedia?.[0]?.path ||
    project?.thumbnail ||
    project?.thumbnailUrl ||
    project?.coverImage ||
    project?.coverImageUrl ||
    project?.coverUrl ||
    project?.cover ||
    project?.image ||
    project?.imageUrl ||
    project?.mainImage ||
    project?.mainImageUrl ||
    project?.projectCover ||
    project?.projectCoverUrl ||
    project?.projectCoverImage ||
    project?.projectCoverImageUrl ||
    project?.media?.cover ||
    project?.media?.coverUrl ||
    project?.media?.thumbnail ||
    project?.media?.thumbnailUrl ||
    project?.images?.[0]?.url ||
    project?.images?.[0]?.secure_url ||
    project?.images?.[0]?.src ||
    project?.images?.[0] ||
    project?.gallery?.[0]?.url ||
    project?.gallery?.[0]?.secure_url ||
    project?.gallery?.[0] ||
    project?.attachments?.[0]?.url ||
    project?.attachments?.[0]?.secure_url ||
    project?.attachments?.[0] ||
    "";

  if (typeof imageCandidate === "string") return imageCandidate;

  if (imageCandidate && typeof imageCandidate === "object") {
    return (
      imageCandidate.url ||
      imageCandidate.secure_url ||
      imageCandidate.src ||
      imageCandidate.path ||
      ""
    );
  }

  return "";
};

const getOrganizerName = (organizer) => {
  return (
    organizer?.fullName ||
    organizer?.name ||
    organizer?.username ||
    organizer?.organizationName ||
    "Người tổ chức"
  );
};

const getEndDateText = (project) => {
  if (project?.endDateText) return project.endDateText;
  if (project?.remainingTimeText) return project.remainingTimeText;
  if (project?.timeLeftText) return project.timeLeftText;

  const endDate = project?.endDate || project?.deadline || project?.finishedAt;

  if (!endDate) return "";

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return "";

  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `Còn ${diffDays} ngày`;
  if (diffDays === 0) return "Hôm nay";
  return "Đã kết thúc";
};

const buildSharedProjectItem = ({
  project,
  progressPercent,
  isFunded,
  isUrgent,
}) => {
  const projectId = project?._id || project?.id;
  const organizer = project?.organizerId;

  const rawDescription =
    project?.description ||
    project?.story ||
    project?.summary ||
    project?.shortDescription ||
    "";

  const rawLocation =
    project?.location ||
    project?.address ||
    project?.fullAddress ||
    project?.projectLocation ||
    "";

  return {
    entityId: projectId,
    entityModel: "Project",

    title: String(project?.title || project?.name || "Dự án").slice(0, 200),

    thumbnail: getProjectThumbnail(project),

    description: stripHtml(rawDescription).slice(0, 500),

    ownerName: getOrganizerName(organizer).slice(0, 100),

    location: String(getTextValue(rawLocation, "")).slice(0, 200),

    endDateText: String(getEndDateText(project)).slice(0, 100),

    fundingPercent: Number(progressPercent || 0),
    isFunded: Boolean(isFunded),
    isUrgent: Boolean(isUrgent || project?.isUrgent),
  };
};

function ShareProjectModal({ project, sharedItem, onClose }) {
  const modalContent = (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-slate-900/60 px-4 py-8 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-900">Chia sẻ dự án</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X size={22} />
          </button>
        </div>

        <PostForm
          sharedItem={sharedItem}
          initialContent={`Dự án ý nghĩa: "${
            project?.title || project?.name || "Dự án"
          }". Mọi người cùng chung tay nhé! 🚀`}
          defaultPrivacy="public"
          showPrivacySelector={true}
          embedded={true}
          onCancelShare={onClose}
          onPostSuccess={onClose}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function SidebarPublic({ project }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore(authSelectors.user);
  const { follow, unfollow } = useFollowMutations();
  const { mutateAsync: reportProject, isPending: isReporting } =
    useReportProject();

  const location = useLocation();
  const navigate = useNavigate();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState("");
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

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

  const sharedProjectItem = useMemo(
    () =>
      buildSharedProjectItem({
        project,
        progressPercent,
        isFunded,
        isUrgent: project?.isUrgent,
      }),
    [project, progressPercent, isFunded],
  );

  const handleShare = () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để chia sẻ dự án");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setIsShareOpen(true);
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

    const remainingAmount = Math.max(
      Number(targetAmount || 0) - Number(availableBalance || 0),
      0,
    );

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
        error?.response?.data?.message ||
          "Gửi báo cáo thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <>
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

      {isShareOpen && (
        <ShareProjectModal
          project={project}
          sharedItem={sharedProjectItem}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </>
  );
}

export default SidebarPublic;