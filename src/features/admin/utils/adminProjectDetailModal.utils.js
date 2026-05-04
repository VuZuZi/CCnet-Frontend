import {
  CheckCircle,
  PauseCircle,
  RefreshCw,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

import { stripHtml } from "./projectFilter.utils";
import {
  formatDateOnly,
  formatVnd,
  resolveProjectCoverUrl,
  toDisplayValue,
} from "./adminProjectDisplay.utils";

export const STATUS_ICON_MAP = {
  PENDING_APPROVAL: Clock,
  ACTIVE: CheckCircle,
  UPDATING: RefreshCw,
  PAUSED: PauseCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
  DEFAULT: AlertCircle,
};

function pickFirstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function normalizeDocumentItem(doc = {}, index = 0) {
  const nestedFile = doc?.file || doc?.asset || doc?.document || null;

  const url = pickFirstNonEmpty(
    doc?.url,
    doc?.secureUrl,
    doc?.secure_url,
    doc?.fileUrl,
    doc?.fileURL,
    doc?.downloadUrl,
    doc?.downloadURL,
    doc?.previewUrl,
    doc?.previewURL,
    doc?.path,
    doc?.src,
    nestedFile?.url,
    nestedFile?.secureUrl,
    nestedFile?.secure_url,
    nestedFile?.fileUrl,
    nestedFile?.downloadUrl,
    nestedFile?.previewUrl,
    nestedFile?.path,
    nestedFile?.src
  );

  const name = pickFirstNonEmpty(
    doc?.originalName,
    doc?.fileName,
    doc?.filename,
    doc?.name,
    doc?.title,
    doc?.publicId,
    nestedFile?.originalName,
    nestedFile?.fileName,
    nestedFile?.filename,
    nestedFile?.name,
    nestedFile?.title,
    nestedFile?.publicId
  );

  const mimetype = pickFirstNonEmpty(
    doc?.mimetype,
    doc?.mimeType,
    doc?.type,
    nestedFile?.mimetype,
    nestedFile?.mimeType,
    nestedFile?.type
  );

  return {
    ...doc,
    ...(nestedFile && typeof nestedFile === "object" ? nestedFile : {}),
    url,
    name: name || `tai-lieu-${index + 1}`,
    originalName: name || `tai-lieu-${index + 1}`,
    mimetype,
  };
}

function extractRawDocuments(project) {
  const candidates = [
    project?.documents,
    project?.documentUrls,
    project?.verificationDocuments,
    project?.verificationDocs,
    project?.attachments,
    project?.files,
    project?.media,
    project?.proofDocuments,
  ];

  const matched = candidates.find((item) => Array.isArray(item) && item.length);
  return Array.isArray(matched) ? matched : [];
}

export function getProjectDetailDescription(project) {
  return stripHtml(project?.description) || "--";
}

export function getProjectDetailCoverUrl(project) {
  return resolveProjectCoverUrl(project);
}

export function getProjectDetailDocuments(project) {
  const rawDocuments = extractRawDocuments(project);

  return rawDocuments.map((doc, index) => normalizeDocumentItem(doc, index));
}

export function getProjectDetailOrganizer(project) {
  return project?.organizer || project?.organizerId || null;
}

export function buildProjectDetailRows(project, documents = []) {
  return [
    { label: "Danh mục", value: project?.category || "--" },
    { label: "Địa điểm", value: toDisplayValue(project?.location) },
    { label: "Mục tiêu gây quỹ (VND)", value: formatVnd(project?.targetAmount) },
    {
      label: "Mục tiêu tình nguyện viên",
      value: toDisplayValue(
        project?.stats?.targetVolunteers ?? project?.targetVolunteers
      ),
    },
    {
      label: "Tình nguyện viên hiện tại",
      value: toDisplayValue(
        project?.stats?.currentVolunteers ?? project?.currentVolunteers
      ),
    },
    { label: "Số tài liệu", value: toDisplayValue(documents.length) },
    { label: "Ngày bắt đầu", value: formatDateOnly(project?.startDate) },
    { label: "Ngày kết thúc", value: formatDateOnly(project?.endDate) },
    { label: "Ngày tạo", value: formatDateOnly(project?.createdAt) },
    { label: "Ngày cập nhật", value: formatDateOnly(project?.updatedAt) },
    { label: "Loại dự án", value: toDisplayValue(project?.projectType) },
    { label: "Trạng thái", value: toDisplayValue(project?.status) },
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
