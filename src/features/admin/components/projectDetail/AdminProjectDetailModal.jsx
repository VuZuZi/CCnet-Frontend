import { useEffect, useMemo, useState } from "react";

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

  const organizer = getProjectDetailOrganizer(project);
  const organizerId = organizer?._id || organizer?.id || "";
  const organizerProfilePath = organizerId ? `/users/${organizerId}` : "";
  const canOpenOrganizerProfile = Boolean(organizerProfilePath);

  const description = getProjectDetailDescription(project);
  const coverUrl = getProjectDetailCoverUrl(project);
  const documents = getProjectDetailDocuments(project);

  const items = useMemo(() => {
    const rows = buildProjectDetailRows(project, documents);
    return filterProjectDetailRows(rows, search);
  }, [documents, project, search]);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <div
        className="relative z-10 flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <ProjectDetailHeader
          project={project}
          onClose={onClose}
          onOpenHistory={onOpenHistory}
          onRequestProjectAction={onRequestProjectAction}
        />

        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
          <ProjectStatusBanner project={project} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.95fr]">
            <div className="space-y-6">
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

            <div className="space-y-6">
              <ProjectOrganizerCard
                organizer={organizer}
                organizerProfilePath={organizerProfilePath}
                canOpenOrganizerProfile={canOpenOrganizerProfile}
              />

              <ProjectDocumentsList documents={documents} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProjectDetailModal;