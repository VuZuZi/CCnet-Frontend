import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminDashboard } from "./useAdminDashboard";
import useAdminProjectsManager from "./useAdminProjectsManager";
import {
  ADMIN_PROJECT_ACTION_KEYS,
  getProjectActionKeyFromNextStatus,
} from "../utils/projectAction.utils";
import {
  getApprovedStatus,
  normalizeProjectStatus,
} from "../utils/projectStatus.utils";
import {
  PROJECTS_PER_PAGE,
  createInitialReasonModalState,
  getPaginationMeta,
  paginateItems,
} from "../utils/projectManagement.utils";

export function useProjectManagementPage() {
  const {
    projects,
    deleteProject,
    updateProjectStatus,
    loading,
    isProjectsFetching,
  } = useAdminDashboard("projects");

  const {
    filterStatus,
    setFilterStatus,
    searchText,
    setSearchText,
    visibleProjects,
    filteredProjects,
    stats,
  } = useAdminProjectsManager(projects);

  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [historyProject, setHistoryProject] = useState(null);
  const [isGlobalHistoryOpen, setIsGlobalHistoryOpen] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState(null);
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState(null);
  const [reasonModal, setReasonModal] = useState(createInitialReasonModalState());
  const [isReasonSubmitting, setIsReasonSubmitting] = useState(false);

  const { totalPages, currentPage, startItem, endItem } = useMemo(
    () => getPaginationMeta(filteredProjects.length, page, PROJECTS_PER_PAGE),
    [filteredProjects.length, page]
  );

  const paginatedProjects = useMemo(
    () => paginateItems(filteredProjects, currentPage, PROJECTS_PER_PAGE),
    [filteredProjects, currentPage]
  );

  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchText]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const syncProjectInOpenViews = useCallback(
    (projectId, updatedProject, fallbackStatus = "") => {
      const mergeProject = (prev) => {
        if (!prev || prev._id !== projectId) return prev;

        return {
          ...prev,
          ...(updatedProject || {}),
          status: updatedProject?.status || fallbackStatus || prev.status,
        };
      };

      setSelectedProject(mergeProject);
      setHistoryProject(mergeProject);
    },
    []
  );

  const openReasonModal = useCallback(
    (project, actionType, actionKey, nextStatus = "") => {
      setReasonModal({
        open: true,
        project,
        actionType,
        actionKey,
        nextStatus,
      });
    },
    []
  );

  const closeReasonModal = useCallback(() => {
    if (isReasonSubmitting) return;
    setReasonModal(createInitialReasonModalState());
  }, [isReasonSubmitting]);

  const handleApprove = useCallback(
    async (project) => {
      if (!project?._id) return;

      const approvedStatus = getApprovedStatus(project);

      try {
        setPendingProjectId(project._id);

        const updated = await updateProjectStatus(project._id, {
          status: approvedStatus,
        });

        syncProjectInOpenViews(project._id, updated, approvedStatus);
      } finally {
        setPendingProjectId(null);
      }
    },
    [syncProjectInOpenViews, updateProjectStatus]
  );

  const requestProjectAction = useCallback(
    (project, nextStatus) => {
      if (!project?._id || !nextStatus) return;

      const currentStatus = normalizeProjectStatus(project?.status);
      const normalizedNextStatus = normalizeProjectStatus(nextStatus);

      if (normalizedNextStatus === currentStatus) return;

      const actionKey = getProjectActionKeyFromNextStatus(
        normalizedNextStatus,
        currentStatus
      );

      if (actionKey === ADMIN_PROJECT_ACTION_KEYS.APPROVE_PROJECT) {
        handleApprove(project);
        return;
      }

      openReasonModal(project, "status", actionKey, normalizedNextStatus);
    },
    [handleApprove, openReasonModal]
  );

  const handleDeleteProject = useCallback(
    (project) => {
      openReasonModal(
        project,
        "delete",
        ADMIN_PROJECT_ACTION_KEYS.DELETE_PROJECT,
        ""
      );
    },
    [openReasonModal]
  );

  const handleReasonConfirm = useCallback(
    async (reason) => {
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

        syncProjectInOpenViews(project._id, updated, nextStatus);
        closeReasonModal();
      } finally {
        setPendingProjectId(null);
        setPendingDeleteProjectId(null);
        setIsReasonSubmitting(false);
      }
    },
    [
      closeReasonModal,
      deleteProject,
      historyProject?._id,
      reasonModal,
      selectedProject?._id,
      syncProjectInOpenViews,
      updateProjectStatus,
    ]
  );

  return {
    loading,
    isProjectsFetching,
    filterStatus,
    setFilterStatus,
    searchText,
    setSearchText,
    visibleProjects,
    filteredProjects,
    stats,
    page,
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
  };
}

export default useProjectManagementPage;