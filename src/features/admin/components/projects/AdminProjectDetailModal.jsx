import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ExternalLink, FileText, Image as ImageIcon, X, CheckCircle, Clock, PauseCircle, XCircle, AlertCircle } from "lucide-react";

const stripHtml = (value) => {
  if (!value) return "";
  return String(value).replace(/<[^>]*>/g, "").trim();
};

const formatDateOnly = (value) => {
  if (!value) return "--";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

const formatVnd = (value) => Number(value || 0).toLocaleString("vi-VN");

const isImageLike = (url, mimetype) => {
  const type = String(mimetype || "").toLowerCase();
  if (type.includes("image/")) return true;
  const u = String(url || "").toLowerCase();
  if (u.includes("image/upload")) return true;
  return Boolean(u.match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i));
};

const isPdfLike = (url, mimetype, name) => {
  const type = String(mimetype || "").toLowerCase();
  if (type.includes("application/pdf")) return true;
  const u = String(url || "").toLowerCase();
  const n = String(name || "").toLowerCase();
  return u.endsWith(".pdf") || n.endsWith(".pdf");
};

const toDisplayValue = (value) => {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const s = String(value).trim();
    return s ? s : "--";
  }
  if (Array.isArray(value)) {
    try {
      return value.length ? value.map((v) => toDisplayValue(v)).join(", ") : "--";
    } catch {
      return "--";
    }
  }
  if (typeof value === "object") {
    const address = value?.address;
    if (typeof address === "string" && address.trim()) return address.trim();
    try {
      return JSON.stringify(value);
    } catch {
      return "--";
    }
  }
  return "--";
};

// Status configuration
const STATUS_CONFIG = {
  PENDING_APPROVAL: { label: "Chờ duyệt", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  ACTIVE: { label: "Đang hoạt động", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  PAUSED: { label: "Tạm ngưng", icon: PauseCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  CANCELLED: { label: "Đã hủy", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  DRAFT: { label: "Bản nháp", icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

export function AdminProjectDetailModal({ open, project, onClose, onStatusChange }) {
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(project?.status || "");

  useEffect(() => {
    if (open && project) {
      setSelectedStatus(project.status || "");
    }
  }, [open, project]);

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
  const description = stripHtml(project?.description) || "--";
  const coverUrl =
    project?.coverMedia?.url ||
    project?.coverMedia?.secure_url ||
    (typeof project?.coverMedia === "string" ? project.coverMedia : null);
  const documents = Array.isArray(project?.documentsMedia)
    ? project.documentsMedia
    : Array.isArray(project?.documents)
      ? project.documents.filter((d) => d && typeof d === "object" && d.url)
      : [];

  const handleStatusChange = async (newStatus) => {
    if (!project?._id || !onStatusChange) return;

    setIsUpdating(true);
    try {
      await onStatusChange(project._id, newStatus);
      setSelectedStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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
      { label: "Documents Count", value: toDisplayValue(documents.length) },
      { label: "Start Date", value: formatDateOnly(project?.startDate) },
      { label: "End Date", value: formatDateOnly(project?.endDate) },
      { label: "Created At", value: formatDateOnly(project?.createdAt) },
      { label: "Updated At", value: formatDateOnly(project?.updatedAt) },
      {
        label: "Current Volunteers",
        value: toDisplayValue(project?.stats?.currentVolunteers),
      },
    ];

    const q = String(search || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.label} ${toDisplayValue(r.value)}`.toLowerCase().includes(q),
    );
  }, [coverUrl, documents.length, project, search]);

  const currentStatusConfig = STATUS_CONFIG[selectedStatus] || STATUS_CONFIG.DRAFT;
  const StatusIcon = currentStatusConfig.icon;

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-3 md:p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-all"
      />

      {/* Modal Container */}
      <div
        className="relative z-10 flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 lg:px-6">
          <div className="min-w-0">
            <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
              {project?.title || "Project"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {project?._id || "--"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Selector */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className={`appearance-none rounded-xl border px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 ${currentStatusConfig.bg} ${currentStatusConfig.border} ${currentStatusConfig.color}`}
              >
                <option value="PENDING_APPROVAL">📋 Chờ duyệt</option>
                <option value="ACTIVE">✅ Kích hoạt</option>
                <option value="PAUSED">⏸️ Tạm ngưng</option>
                <option value="CANCELLED">❌ Hủy</option>
                <option value="DRAFT">📝 Bản nháp</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 sm:h-10 sm:w-10"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-5 lg:p-6">
          {/* Status Banner */}
          <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 ${currentStatusConfig.bg} ${currentStatusConfig.border}`}>
            <StatusIcon className={`h-6 w-6 ${currentStatusConfig.color}`} />
            <div>
              <p className={`text-sm font-bold ${currentStatusConfig.color}`}>
                Trạng thái hiện tại: {currentStatusConfig.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Thay đổi trạng thái để kiểm soát hiển thị dự án trên nền tảng
              </p>
            </div>
          </div>

          {/* Responsive Grid */}
          <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
            {/* Left Column - Description + All Fields */}
            <div className="flex-1 space-y-5">
              {/* Cover Image + Project Details */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                {/* Cover Image */}
                {coverUrl ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 mb-4">
                    <img
                      src={coverUrl}
                      alt="Project cover"
                      className="h-48 w-full object-cover sm:h-56"
                    />
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
                    No cover image
                  </div>
                )}

                {/* Project Details */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Project Details</h4>
                </div>

                <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap break-words sm:mt-4">
                  {description}
                </p>
              </div>

              {/* All Fields Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="text-sm font-bold text-slate-900">All Fields</h4>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search field..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 sm:w-64 md:w-80"
                  />
                </div>

                {/* Responsive Table */}
                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 sm:mt-4">
                  <div className="min-w-[500px]">
                    <div className="grid grid-cols-2 bg-slate-50 text-xs font-bold text-slate-500">
                      <div className="px-3 py-2.5 sm:px-4">Field</div>
                      <div className="px-3 py-2.5 sm:px-4">Value</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {items.map((row) => (
                        <div key={row.label} className="grid grid-cols-2">
                          <div className="break-words px-3 py-2.5 text-xs font-semibold text-slate-500 sm:px-4">
                            {row.label}
                          </div>
                          <div className="break-words px-3 py-2.5 text-xs text-slate-800 sm:px-4 sm:text-sm">
                            {toDisplayValue(row.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Raw JSON */}
                {/* <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-bold text-slate-700">
                    Raw JSON
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100 sm:max-h-80 sm:p-4">
                    {JSON.stringify(project, null, 2)}
                  </pre>
                </details> */}
              </div>
            </div>

            {/* Right Column - Organizer + Documents */}
            <div className="w-full space-y-5 lg:w-96 xl:w-[420px]">
              {/* Organizer Card */}
              <div
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-amber-300 cursor-pointer sm:rounded-2xl sm:p-5"
                onClick={() => {
                  if (organizer?._id || organizer?.id) {
                    window.open(`/users/${organizer?._id || organizer?.id || ""}`, "_blank");
                  }
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-900">Organizer</h4>
                </div>

                <div className="mt-3 flex items-center gap-3 sm:mt-4 sm:gap-4">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 sm:h-14 sm:w-14">
                    {organizer?.avatar ? (
                      <img
                        src={organizer.avatar}
                        alt="Organizer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-600">
                        {(organizer?.fullName || "O").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                        {organizer?.fullName || "Anonymous Organizer"}
                      </p>
                      {organizer?.isVerified && (
                        <BadgeCheck size={16} className="text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                      {organizer?.email || "--"}
                    </p>
                    {organizer?.phone && (
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {organizer.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Verification Documents</h4>
                {documents.length ? (
                  <div className="space-y-2">
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
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition hover:bg-slate-50 sm:gap-3 sm:p-2.5"
                        >
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center sm:h-10 sm:w-10">
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
                            <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                              {name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {mimetype || (pdf ? "application/pdf" : "file")}
                            </p>
                          </div>
                          <ExternalLink size={14} className="text-slate-300 flex-shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
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