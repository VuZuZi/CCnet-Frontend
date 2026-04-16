import { normalizeProjectStatus } from "./projectStatus.utils";

export const ADMIN_PROJECT_DELETE_ALLOWED_STATUSES = [
  "PENDING_APPROVAL",
  "UNDER_REVIEW",
  "REVISION_REQUESTED",
  "REJECTED",
];

export function canDeleteProject(projectOrStatus) {
  const status =
    typeof projectOrStatus === "string"
      ? projectOrStatus
      : projectOrStatus?.status;

  const normalizedStatus = normalizeProjectStatus(status);

  return ADMIN_PROJECT_DELETE_ALLOWED_STATUSES.includes(normalizedStatus);
}

export default {
  canDeleteProject,
  ADMIN_PROJECT_DELETE_ALLOWED_STATUSES,
};  