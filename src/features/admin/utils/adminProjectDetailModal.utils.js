import {
  CheckCircle,
  PauseCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

import { stripHtml } from "./projectFilter.utils";
import {
  formatDateOnly,
  formatVnd,
  resolveProjectCoverUrl,
  resolveProjectDocuments,
  toDisplayValue,
} from "./adminProjectDisplay.utils";

export const STATUS_ICON_MAP = {
  PENDING_APPROVAL: Clock,
  ACTIVE: CheckCircle,
  PAUSED: PauseCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
  DEFAULT: AlertCircle,
};

export function getProjectDetailDescription(project) {
  return stripHtml(project?.description) || "--";
}

export function getProjectDetailCoverUrl(project) {
  return resolveProjectCoverUrl(project);
}

export function getProjectDetailDocuments(project) {
  return resolveProjectDocuments(project);
}

export function getProjectDetailOrganizer(project) {
  return project?.organizer || project?.organizerId || null;
}

export function buildProjectDetailRows(project, documents = []) {
  return [
    { label: "Category", value: project?.category || "--" },
    { label: "Location", value: toDisplayValue(project?.location) },
    { label: "Target Amount (VND)", value: formatVnd(project?.targetAmount) },
    { label: "Current Amount (VND)", value: formatVnd(project?.currentAmount) },
    {
      label: "Target Volunteers",
      value: toDisplayValue(project?.stats?.targetVolunteers),
    },
    {
      label: "Current Volunteers",
      value: toDisplayValue(project?.stats?.currentVolunteers),
    },
    { label: "Documents Count", value: toDisplayValue(documents.length) },
    { label: "Start Date", value: formatDateOnly(project?.startDate) },
    { label: "End Date", value: formatDateOnly(project?.endDate) },
    { label: "Created At", value: formatDateOnly(project?.createdAt) },
    { label: "Updated At", value: formatDateOnly(project?.updatedAt) },
    { label: "Project Type", value: toDisplayValue(project?.projectType) },
    { label: "Status", value: toDisplayValue(project?.status) },
  ];
}

export function filterProjectDetailRows(rows = [], search = "") {
  const normalizedQuery = String(search || "").trim().toLowerCase();
  if (!normalizedQuery) return rows;

  return rows.filter((row) =>
    `${row.label} ${toDisplayValue(row.value)}`
      .toLowerCase()
      .includes(normalizedQuery)
  );
}