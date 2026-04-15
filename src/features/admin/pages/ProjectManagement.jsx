import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Loader2,
  History,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAdminDashboard } from "../hooks/useAdminDashboard";
import AdminProjectDetailModal from "../components/projects/AdminProjectDetailModal";
import ProjectActionHistoryModal from "../components/projects/ProjectActionHistoryModal";
import ProjectActionReasonModal from "../components/projects/ProjectActionReasonModal";
import AdminProjectCard from "../components/projects/AdminProjectCard";

import {
  ADMIN_UI_PROJECT_STATUS,
  getApprovedStatus,
  normalizeProjectStatus,
} from "../utils/projectStatus.utils";
import {
  ADMIN_PROJECT_ACTION_KEYS,
  getProjectActionKeyFromNextStatus,
} from "../utils/projectAction.utils";
import {
  filterAdminProjects,
  getAdminProjectStats,
  getAdminVisibleProjects,
} from "../utils/projectFilter.utils";

const PROJECTS_PER_PAGE = 8;

const createInitialReasonModalState = () => ({
  open: false,
  project: null,
  actionKey: "",
  nextStatus: "",
  actionType: "",
});

const FILTER_CONFIG = [
  {
    key: "ALL",
    label: "All",
    activeClassName:
      "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-900 shadow-sm",
    idleClassName:
      "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.PENDING_APPROVAL,
    label: "Pending Review",
    activeClassName:
      "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-900 shadow-sm",
    idleClassName:
      "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.ACTIVE,
    label: "Active",
    activeClassName:
      "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-sm",
    idleClassName:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.PAUSED,
    label: "Paused",
    activeClassName:
      "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm",
    idleClassName:
      "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.COMPLETED,
    label: "Completed",
    activeClassName:
      "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm",
    idleClassName:
      "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    key: ADMIN_UI_PROJECT_STATUS.CANCELLED,
    label: "Cancelled",
    activeClassName:
      "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm",
    idleClassName:
      "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
];

const ProjectManagement = () => {
  const {
    projects,
    deleteProject,
    updateProjectStatus,
    loading,
    isProjectsFetching,
  } = useAdminDashboard("projects");

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const [selectedProject, setSelectedProject] = useState(null);
  const [historyProject, setHistoryProject] = useState(null);
  const [isGlobalHistoryOpen, setIsGlobalHistoryOpen] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState(null);
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState(null);
  const [reasonModal, setReasonModal] = useState(createInitialReasonModalState);
  const [isReasonSubmitting, setIsReasonSubmitting] = useState(false);

  const visibleProjects = useMemo(
    () => getAdminVisibleProjects(projects),
    [projects]
  );

  const filteredProjects = useMemo(
    () => filterAdminProjects(projects, filterStatus, searchText),
    [projects, filterStatus, searchText]
  );

  const stats = useMemo(() => getAdminProjectStats(projects), [projects]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE)),
    [filteredProjects.length]
  );

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * PROJECTS_PER_PAGE;
    const end = start + PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, page]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchText]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const syncProjectInLocalViews = (
    projectId,
    updatedProject,
    fallbackStatus = ""
  ) => {
    if (selectedProject?._id === projectId) {
      setSelectedProject((prev) =>
        prev
          ? {
              ...prev,
              ...(updatedProject || {}),
              status: updatedProject?.status || fallbackStatus || prev.status,
            }
          : prev
      );
    }

    if (historyProject?._id === projectId) {
      setHistoryProject((prev) =>
        prev
          ? {
              ...prev,
              ...(updatedProject || {}),
              status: updatedProject?.status || fallbackStatus || prev.status,
            }
          : prev
      );
    }
  };

  const openReasonModal = (project, actionType, actionKey, nextStatus = "") => {
    setReasonModal({
      open: true,
      project,
      actionType,
      actionKey,
      nextStatus,
    });
  };

  const closeReasonModal = () => {
    if (isReasonSubmitting) return;
    setReasonModal(createInitialReasonModalState());
  };

  const requestProjectAction = (project, nextStatus) => {
    if (!project?._id || !nextStatus) return;

    const currentStatus = normalizeProjectStatus(project?.status);
    const normalizedNextStatus = normalizeProjectStatus(nextStatus);

    if (normalizedNextStatus === currentStatus) {
      return;
    }

    const actionKey = getProjectActionKeyFromNextStatus(
      normalizedNextStatus,
      currentStatus
    );

    if (actionKey === ADMIN_PROJECT_ACTION_KEYS.APPROVE_PROJECT) {
      handleApprove(project);
      return;
    }

    openReasonModal(project, "status", actionKey, normalizedNextStatus);
  };

  const handleApprove = async (project) => {
    if (!project?._id) return;

    const approvedStatus = getApprovedStatus(project);

    try {
      setPendingProjectId(project._id);

      const updated = await updateProjectStatus(project._id, {
        status: approvedStatus,
      });

      syncProjectInLocalViews(project._id, updated, approvedStatus);
    } finally {
      setPendingProjectId(null);
    }
  };

  const handleReasonConfirm = async (reason) => {
    const { project, actionType, nextStatus } = reasonModal;
    if (!project?._id) return;

    try {
      setIsReasonSubmitting(true);

      if (actionType === "delete") {
        setPendingDeleteProjectId(project._id);

        await deleteProject(project._id, { reason });

        if (selectedProject?._id === project._id) {
          setSelectedProject(null);
        }

        if (historyProject?._id === project._id) {
          setHistoryProject(null);
        }

        closeReasonModal();
        return;
      }

      setPendingProjectId(project._id);

      const updated = await updateProjectStatus(project._id, {
        status: nextStatus,
        reason,
      });

      syncProjectInLocalViews(project._id, updated, nextStatus);

      closeReasonModal();
    } finally {
      setPendingProjectId(null);
      setPendingDeleteProjectId(null);
      setIsReasonSubmitting(false);
    }
  };

  const handleDeleteProject = (project) => {
    openReasonModal(
      project,
      "delete",
      ADMIN_PROJECT_ACTION_KEYS.DELETE_PROJECT,
      ""
    );
  };

  const startItem =
    filteredProjects.length === 0 ? 0 : (page - 1) * PROJECTS_PER_PAGE + 1;
  const endItem = Math.min(page * PROJECTS_PER_PAGE, filteredProjects.length);

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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-semibold text-slate-900">
                Projects
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage project status, moderation actions, progress, and history
                across the platform.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[420px] xl:items-end">
              <div className="flex w-full flex-col gap-3 sm:flex-row xl:justify-end">
                <div className="relative flex-1 xl:min-w-[320px]">
                  <Search
                    size={18}
                    strokeWidth={2.2}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by title, organizer, email, or ID..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsGlobalHistoryOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 hover:border-amber-600"
                >
                  <History size={16} strokeWidth={2.2} />
                  View All Project Logs
                </button>
              </div>

              {isProjectsFetching ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  <Loader2 size={14} className="animate-spin" />
                  Refreshing data...
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {FILTER_CONFIG.map((filter) => {
              const count =
                filter.key === "ALL" ? stats.total : stats[filter.key] || 0;

              const isActive = filterStatus === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setFilterStatus(filter.key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive ? filter.activeClassName : filter.idleClassName
                  }`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

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

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">{startItem}</span>
              {" – "}
              <span className="font-semibold text-slate-800">{endItem}</span>
              {" "}of{" "}
              <span className="font-semibold text-slate-800">
                {filteredProjects.length}
              </span>{" "}
              projects
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                {page} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      <AdminProjectDetailModal
        open={Boolean(selectedProject)}
        project={selectedProject}
        onOpenHistory={(project) => setHistoryProject(project)}
        onRequestProjectAction={(project, nextStatus) =>
          requestProjectAction(project, nextStatus)
        }
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