import { FolderKanban, Loader2 } from "lucide-react";
import useProjectManagementPage from "../hooks/useProjectManagementPage";
import AdminProjectDetailModal from "../components/projectDetail/AdminProjectDetailModal";
import ProjectActionHistoryModal from "../components/projects/ProjectActionHistoryModal";
import ProjectActionReasonModal from "../components/projects/ProjectActionReasonModal";
import AdminProjectCard from "../components/projectCard/AdminProjectCard";
import ProjectManagementHeader from "../components/projects/ProjectManagementHeader";
import ProjectManagementPagination from "../components/projects/ProjectManagementPagination";

const ProjectManagement = () => {
  const {
    loading,
    isProjectsFetching,
    filterStatus,
    setFilterStatus,
    searchText,
    setSearchText,
    visibleProjects,
    filteredProjects,
    stats,
    setPage,
    totalPages,
    currentPage,
    startItem,
    endItem,
    paginatedProjects,
    selectedProject,
    setSelectedProject,
    historyProject,
    setHistoryProject,
    isGlobalHistoryOpen,
    setIsGlobalHistoryOpen,
    pendingProjectId,
    pendingDeleteProjectId,
    reasonModal,
    isReasonSubmitting,
    closeReasonModal,
    handleApprove,
    requestProjectAction,
    handleDeleteProject,
    handleReasonConfirm,
  } = useProjectManagementPage();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-500 shadow-sm">
          <Loader2 size={18} className="animate-spin text-amber-500" />
          Loading projects...
        </div>
      </div>
    );
  }

  if (!visibleProjects.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl shadow-inner">
          📁
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          No projects available
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          There are currently no projects visible in the admin workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProjectManagementHeader
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        searchText={searchText}
        onSearchChange={setSearchText}
        stats={stats}
        isProjectsFetching={isProjectsFetching}
        onOpenGlobalHistory={() => setIsGlobalHistoryOpen(true)}
      />

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 shadow-inner">
            <FolderKanban size={30} strokeWidth={2.1} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            No matching projects
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try changing the status filter or search keyword.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {paginatedProjects.map((project) => (
              <AdminProjectCard
                key={project._id}
                project={project}
                pendingProjectId={pendingProjectId}
                pendingDeleteProjectId={pendingDeleteProjectId}
                onRequestProjectAction={requestProjectAction}
                onApprove={handleApprove}
                onOpenHistory={setHistoryProject}
                onDelete={handleDeleteProject}
                onOpenDetail={setSelectedProject}
              />
            ))}
          </div>

          <ProjectManagementPagination
            startItem={startItem}
            endItem={endItem}
            totalItems={filteredProjects.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          />
        </>
      )}

      <AdminProjectDetailModal
        open={Boolean(selectedProject)}
        project={selectedProject}
        onOpenHistory={setHistoryProject}
        onRequestProjectAction={requestProjectAction}
        onClose={() => setSelectedProject(null)}
      />

      <ProjectActionHistoryModal
        open={Boolean(historyProject)}
        project={historyProject}
        onClose={() => setHistoryProject(null)}
      />

      <ProjectActionHistoryModal
        open={isGlobalHistoryOpen}
        project={null}
        onClose={() => setIsGlobalHistoryOpen(false)}
      />

      <ProjectActionReasonModal
        open={reasonModal.open}
        project={reasonModal.project}
        actionKey={reasonModal.actionKey}
        loading={isReasonSubmitting}
        onClose={closeReasonModal}
        onConfirm={handleReasonConfirm}
      />
    </div>
  );
};

export default ProjectManagement;