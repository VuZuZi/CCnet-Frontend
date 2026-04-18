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

  const handleReasonConfirm = useCallback(
    async (reason) => {
      const { project, nextStatus } = reasonModal;
      if (!project?._id) return;

      try {
        setIsReasonSubmitting(true);
        setPendingProjectId(project._id);

        const updated = await updateProjectStatus(project._id, {
          status: nextStatus,
          reason,
        });

        syncProjectInOpenViews(project._id, updated, nextStatus);
        closeReasonModal();
      } finally {
        setPendingProjectId(null);
        setIsReasonSubmitting(false);
      }
    },
    [
      closeReasonModal,
      reasonModal,
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
    reasonModal,
    isReasonSubmitting,
    closeReasonModal,
    handleApprove,
    requestProjectAction,
    handleReasonConfirm,
  };
}

export default useProjectManagementPage;