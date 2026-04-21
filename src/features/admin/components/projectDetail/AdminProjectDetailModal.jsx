import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileText, X } from "lucide-react";

import { adminAPI } from "../../api/adminAPI";
import ProjectDetailHeader from "./ProjectDetailHeader";
import ProjectStatusBanner from "./ProjectStatusBanner";
import ProjectDescriptionSection from "./ProjectDescriptionSection";
import ProjectFieldsTable from "./ProjectFieldsTable";
import ProjectOrganizerCard from "./ProjectOrganizerCard";
import ProjectDocumentsList from "./ProjectDocumentsList";

import {
  buildProjectDetailRows,
  filterProjectDetailRows,
  getProjectDetailCoverUrl,
  getProjectDetailDescription,
  getProjectDetailDocuments,
  getProjectDetailOrganizer,
} from "../../utils/adminProjectDetailModal.utils";
import {
  isImageLike,
  isPdfLike,
} from "../../utils/adminProjectDisplay.utils";

function normalizeProjectDetailResponse(response) {
  if (!response) return null;
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

function hasDisplayValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

function DocumentPreviewModal({ open, document, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !document) return null;

  const url = document?.url || "";
  const name =
    document?.originalName ||
    document?.name ||
    document?.publicId ||
    "Tài liệu";
  const mimetype = document?.mimetype || document?.mimeType || "";

  const isImage = isImageLike(url, mimetype);
  const isPdf = isPdfLike(url, mimetype, name);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Đóng preview tài liệu"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
      />

      <div
        className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 md:px-5">
          <div className="min-w-0">
            <p className="truncate text-base font-black text-slate-900">
              {name}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {mimetype || "Tài liệu"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
              >
                <ExternalLink size={14} />
                Mở tab mới
              </a>
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

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100">
          {!url ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
                <FileText size={28} />
              </div>
              <p className="text-lg font-black text-slate-900">
                Không có liên kết tài liệu
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Tài liệu này chưa có URL hợp lệ từ server nên chưa thể preview.
              </p>
            </div>
          ) : isImage ? (
            <div className="flex h-full items-center justify-center p-4">
              <img
                src={url}
                alt={name}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>
          ) : isPdf ? (
            <iframe
              title={name}
              src={url}
              className="h-full w-full bg-white"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
                <FileText size={28} />
              </div>
              <p className="text-lg font-black text-slate-900">
                Loại tệp này chưa hỗ trợ preview trực tiếp
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Bạn có thể mở tài liệu ở tab mới để xem nội dung.
              </p>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-900 transition hover:brightness-105"
              >
                <ExternalLink size={14} />
                Mở tài liệu
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminProjectDetailModal({
  open,
  project,
  onClose,
  onOpenHistory,
  onRequestProjectAction,
}) {
  const [search, setSearch] = useState("");
  const [detailProject, setDetailProject] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !previewDocument) onClose?.();
    };

    const originalOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, previewDocument]);

  useEffect(() => {
    if (open) {
      setSearch("");
    } else {
      setPreviewDocument(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !project?._id) {
      setDetailProject(null);
      setDetailError("");
      setIsLoadingDetail(false);
      return;
    }

    let cancelled = false;

    const fetchProjectDetail = async () => {
      try {
        setIsLoadingDetail(true);
        setDetailError("");

        const response = await adminAPI.getProjectDetail(project._id);
        const normalized = normalizeProjectDetailResponse(response);

        if (!cancelled) {
          setDetailProject(normalized || null);
        }
      } catch (error) {
        if (!cancelled) {
          setDetailProject(null);
          setDetailError(
            error?.response?.data?.message || "Không tải được chi tiết dự án."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchProjectDetail();

    return () => {
      cancelled = true;
    };
  }, [open, project?._id]);

  const displayProject = detailProject || project;

  const organizer = getProjectDetailOrganizer(displayProject);
  const organizerId = organizer?._id || organizer?.id || "";
  const organizerProfilePath = organizerId ? `/users/${organizerId}` : "";
  const canOpenOrganizerProfile = Boolean(organizerProfilePath);

  const description = getProjectDetailDescription(displayProject);
  const coverUrl = getProjectDetailCoverUrl(displayProject);
  const documents = getProjectDetailDocuments(displayProject);

  const items = useMemo(() => {
    const rows = buildProjectDetailRows(displayProject, documents);
    const filteredRows = filterProjectDetailRows(rows, search);

    return filteredRows.filter(
      (row) => row?.label && hasDisplayValue(row?.value)
    );
  }, [displayProject, documents, search]);

  if (!open || !project) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4">
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-[6px]"
        />

        <div
          className="relative z-10 flex h-[94vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-200 bg-white">
            <ProjectDetailHeader
              project={displayProject}
              onClose={onClose}
              onOpenHistory={onOpenHistory}
              onRequestProjectAction={onRequestProjectAction}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,#F8FAFC_0%,#F1F5F9_100%)] px-3 py-3 md:px-5 md:py-5">
            {isLoadingDetail ? (
              <div className="space-y-5">
                <div className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                  <div className="h-5 w-44 rounded bg-slate-200" />
                  <div className="mt-4 h-56 rounded-[20px] bg-slate-100 md:h-72" />
                  <div className="mt-4 space-y-3">
                    <div className="h-4 w-full rounded bg-slate-100" />
                    <div className="h-4 w-11/12 rounded bg-slate-100" />
                    <div className="h-4 w-8/12 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
                  <div className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="mt-4 space-y-3">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-12 rounded-2xl bg-slate-100"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                      <div className="h-5 w-32 rounded bg-slate-200" />
                      <div className="mt-4 h-20 rounded-2xl bg-slate-100" />
                    </div>

                    <div className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                      <div className="h-5 w-36 rounded bg-slate-200" />
                      <div className="mt-4 space-y-3">
                        <div className="h-14 rounded-2xl bg-slate-100" />
                        <div className="h-14 rounded-2xl bg-slate-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : detailError ? (
              <div className="rounded-[24px] border border-red-100 bg-white p-8 text-center shadow-sm md:p-10">
                <p className="text-lg font-black text-red-500">
                  Không tải được chi tiết dự án
                </p>
                <p className="mt-2 text-sm text-slate-500">{detailError}</p>
              </div>
            ) : (
              <div className="space-y-5">
                <ProjectStatusBanner project={displayProject} />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
                  <div className="min-w-0 space-y-5">
                    <ProjectDescriptionSection
                      coverUrl={coverUrl}
                      description={description}
                    />

                    <ProjectFieldsTable
                      items={items}
                      search={search}
                      onSearchChange={setSearch}
                    />
                  </div>

                  <div className="min-w-0 space-y-5">
                    <ProjectOrganizerCard
                      organizer={organizer}
                      organizerProfilePath={organizerProfilePath}
                      canOpenOrganizerProfile={canOpenOrganizerProfile}
                    />

                    <ProjectDocumentsList
                      documents={documents}
                      onPreviewDocument={setPreviewDocument}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentPreviewModal
        open={Boolean(previewDocument)}
        document={previewDocument}
        onClose={() => setPreviewDocument(null)}
      />
    </>
  );
}

export default AdminProjectDetailModal;