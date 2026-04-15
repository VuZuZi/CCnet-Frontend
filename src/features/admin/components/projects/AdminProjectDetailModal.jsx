import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ExternalLink,
  FileText,
  X,
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  AlertCircle,
  History,
} from "lucide-react";

import {
  getAdminUIStatusStyle,
  getApprovedStatus,
  getAdminUIStatusLabel,
  isReviewableProjectStatus,
  mapProjectStatusToUI,
} from "../../utils/projectStatus.utils";
import { stripHtml } from "../../utils/projectFilter.utils";
import {
  formatDateOnly,
  formatVnd,
  isImageLike,
  isPdfLike,
  resolveProjectCoverUrl,
  resolveProjectDocuments,
  toDisplayValue,
} from "../../utils/adminProjectDisplay.utils";

const STATUS_ICON_MAP = {
  PENDING_APPROVAL: Clock,
  ACTIVE: CheckCircle,
  PAUSED: PauseCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
  DEFAULT: AlertCircle,
};

export function AdminProjectDetailModal({
  open,
  project,
  onClose,
  onOpenHistory,
  onRequestProjectAction,
}) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const originalOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const organizer = project?.organizer || project?.organizerId || null;
  const organizerId = organizer?._id || organizer?.id || "";
  const organizerProfilePath = organizerId ? `/users/${organizerId}` : "";
  const canOpenOrganizerProfile = Boolean(organizerProfilePath);

  const description = stripHtml(project?.description) || "--";
  const coverUrl = resolveProjectCoverUrl(project);
  const documents = resolveProjectDocuments(project);

  const items = useMemo(() => {
    const rows = [
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

    const normalizedQuery = String(search || "").trim().toLowerCase();
    if (!normalizedQuery) return rows;

    return rows.filter((row) =>
      `${row.label} ${toDisplayValue(row.value)}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [documents.length, project, search]);

  const uiStatus = mapProjectStatusToUI(project?.status);
  const currentStatusStyle = getAdminUIStatusStyle(uiStatus);
  const currentStatusLabel = getAdminUIStatusLabel(uiStatus);
  const StatusIcon = STATUS_ICON_MAP[uiStatus] || STATUS_ICON_MAP.DEFAULT;

  const canApprove = isReviewableProjectStatus(project?.status);
  const canOpenHistory = Boolean(onOpenHistory);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <div
        className="relative z-10 flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-tight text-slate-900 md:text-xl">
              {project?.title || "Project"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              {project?._id || "--"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold ${currentStatusStyle.bg} ${currentStatusStyle.border} ${currentStatusStyle.text}`}
            >
              <StatusIcon size={16} />
              {currentStatusLabel}
            </div>

            {canApprove ? (
              <button
                type="button"
                onClick={() =>
                  onRequestProjectAction?.(project, getApprovedStatus(project))
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-600"
              >
                <CheckCircle size={15} />
                Approve
              </button>
            ) : null}

            {canOpenHistory ? (
              <button
                type="button"
                onClick={() => onOpenHistory?.(project)}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 transition hover:bg-amber-100"
              >
                <History size={15} />
                View History
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${currentStatusStyle.bg} ${currentStatusStyle.border}`}
          >
            <div
              className={`rounded-2xl bg-white p-2 shadow-sm ${currentStatusStyle.text}`}
            >
              <StatusIcon className="h-5 w-5" />
            </div>

            <div>
              <p className={`text-sm font-bold ${currentStatusStyle.text}`}>
                Current status: {currentStatusLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Administrative actions that require reasons are handled on the
                main page to preserve complete logs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.95fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                {coverUrl ? (
                  <div className="mb-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                    <img
                      src={coverUrl}
                      alt="Project cover"
                      className="h-64 w-full object-cover md:h-80"
                    />
                  </div>
                ) : (
                  <div className="mb-5 flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 md:h-80">
                    No cover image
                  </div>
                )}

                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-base font-black text-slate-900">
                    Project Description
                  </h4>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {description}
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h4 className="text-base font-black text-slate-900">
                    All Fields
                  </h4>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search field..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 md:w-80"
                  />
                </div>

                <div className="mt-4 overflow-x-auto rounded-[24px] border border-slate-200">
                  <div className="min-w-[560px]">
                    <div className="grid grid-cols-2 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                      <div className="px-4 py-3">Field</div>
                      <div className="px-4 py-3">Value</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {items.map((row) => (
                        <div key={row.label} className="grid grid-cols-2">
                          <div className="break-words px-4 py-3 text-xs font-bold text-slate-500">
                            {row.label}
                          </div>
                          <div className="break-words px-4 py-3 text-sm text-slate-800">
                            {toDisplayValue(row.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md"
                onClick={() => {
                  if (canOpenOrganizerProfile) {
                    window.open(
                      organizerProfilePath,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">
                    Organizer
                  </h4>

                  {canOpenOrganizerProfile ? (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                      Open
                      <ExternalLink size={12} />
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {organizer?.avatar ? (
                      <img
                        src={organizer.avatar}
                        alt="Organizer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-600">
                        {(organizer?.fullName || "O").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black text-slate-900 md:text-base">
                        {organizer?.fullName || "Anonymous Organizer"}
                      </p>

                      {organizer?.isVerified ? (
                        <BadgeCheck
                          size={16}
                          className="shrink-0 text-blue-500"
                        />
                      ) : null}
                    </div>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {organizer?.email || "--"}
                    </p>

                    {organizer?.phone ? (
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {organizer.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-4 text-base font-black text-slate-900">
                  Verification Documents
                </h4>

                {documents.length ? (
                  <div className="space-y-3">
                    {documents.map((doc, idx) => {
                      const url = doc?.url;
                      const name =
                        doc?.originalName ||
                        doc?.name ||
                        doc?.publicId ||
                        `document-${idx + 1}`;
                      const mimetype = doc?.mimetype || doc?.mimeType || "";
                      const image = isImageLike(url, mimetype);
                      const pdf = isPdfLike(url, mimetype, name);

                      return (
                        <a
                          key={`${doc?._id || doc?.publicId || idx}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-amber-200 hover:bg-amber-50/40"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {image ? (
                              <img
                                src={url}
                                alt={name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FileText
                                className={pdf ? "text-red-500" : "text-slate-500"}
                                size={16}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {mimetype || (pdf ? "application/pdf" : "file")}
                            </p>
                          </div>

                          <ExternalLink
                            size={14}
                            className="shrink-0 text-slate-300"
                          />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                    No documents
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProjectDetailModal;