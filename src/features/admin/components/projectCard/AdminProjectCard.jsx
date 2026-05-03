import {
  mapProjectStatusToUI,
  normalizeProjectStatus,
} from "../../utils/projectStatus.utils";
import { stripHtml } from "../../utils/projectFilter.utils";
import {
  resolveFundingSummary,
  resolveProjectCoverUrl,
  resolveProjectDocumentsCount,
  resolveProjectOrganizer,
  resolveProjectTimelineState,
  resolveVolunteerSummary,
} from "../../utils/adminProjectDisplay.utils";
import { getCardTone } from "../../utils/adminProjectCard.utils";

import AdminProjectCardHeader from "./AdminProjectCardHeader";
import AdminProjectCardMetrics from "./AdminProjectCardMetrics";
import AdminProjectCardTimeline from "./AdminProjectCardTimeline";
import AdminProjectCardFooterActions from "./AdminProjectCardFooterActions";

export default function AdminProjectCard({
  project,
  pendingProjectId,
  onOpenHistory,
  onOpenDetail,
  onOpenReview,
  onRequestProjectAction,
}) {
  const realStatus = normalizeProjectStatus(project?.status);
  const uiStatus = mapProjectStatusToUI(realStatus);
  const tone = getCardTone(uiStatus);

  const { currentAmount, targetAmount, isFundraising, fundsPercent } =
    resolveFundingSummary(project);

  const {
    rolesCount,
    currentVolunteers,
    targetVolunteers,
    hasVolunteerTarget,
    volunteerPercent,
  } = resolveVolunteerSummary(project);

  const { daysRemaining, isExpired, showExpiredBadge } =
    resolveProjectTimelineState(project, uiStatus);

  const descriptionText =
    stripHtml(project?.description) || "Không có mô tả.";
  const coverUrl = resolveProjectCoverUrl(project);
  const documentsCount = resolveProjectDocumentsCount(project);
  const organizer = resolveProjectOrganizer(project);

  const isUpdatingThisProject = pendingProjectId === project._id;
  return (
    <div
      className={`group overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${tone.card}`}
    >
      <AdminProjectCardHeader
        project={project}
        tone={tone}
        uiStatus={uiStatus}
        organizer={organizer}
        coverUrl={coverUrl}
        documentsCount={documentsCount}
        descriptionText={descriptionText}
        isUpdatingThisProject={isUpdatingThisProject}
        onOpenHistory={onOpenHistory}
      />

      <div className="space-y-4 p-4">
        <AdminProjectCardMetrics
          tone={tone}
          currentAmount={currentAmount}
          targetAmount={targetAmount}
          isFundraising={isFundraising}
          fundsPercent={fundsPercent}
          rolesCount={rolesCount}
          currentVolunteers={currentVolunteers}
          targetVolunteers={targetVolunteers}
          hasVolunteerTarget={hasVolunteerTarget}
          volunteerPercent={volunteerPercent}
        />

        <AdminProjectCardTimeline
          tone={tone}
          project={project}
          daysRemaining={daysRemaining}
          isExpired={isExpired}
          showExpiredBadge={showExpiredBadge}
        />

        <AdminProjectCardFooterActions
          project={project}
          onOpenDetail={onOpenDetail}
          onOpenHistory={onOpenHistory}
          onOpenReview={onOpenReview}
          onRequestProjectAction={onRequestProjectAction}
        />
      </div>
    </div>
  );
}
