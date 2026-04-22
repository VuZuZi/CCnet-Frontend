import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/contexts/ToastContext";
import { adminAPI } from "../api/adminAPI";
import {
  ADMIN_PROJECTS_QUERY_KEY,
  ADMIN_REPORTS_QUERY_KEY,
  ADMIN_STATS_QUERY_KEY,
  ADMIN_USERS_QUERY_KEY,
  ADMIN_QUERY_KEYS,
} from "../constants/admin.queryKeys";

const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallback;

const normalizeResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const normalizeListResponse = (response) => {
  const payload = normalizeResponseData(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const normalizeProjectsResponse = (response) => {
  const payload = normalizeResponseData(response);

  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    pagination: payload?.pagination || null,
  };
};

const ensureReason = (reason, actionLabel) => {
  const normalizedReason = String(reason || "").trim();

  if (!normalizedReason) {
    throw new Error(`Reason is required to ${actionLabel}.`);
  }

  return normalizedReason;
};

export const useAdminDashboard = (activeTab) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const actionLogsQueryKey = ADMIN_QUERY_KEYS.actionLogs.all();

  const statsQuery = useQuery({
    queryKey: ADMIN_STATS_QUERY_KEY,
    queryFn: async () => normalizeResponseData(await adminAPI.getStats()),
    enabled: activeTab === "overview",
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const usersQuery = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: async () => normalizeListResponse(await adminAPI.getUsers()),
    enabled: activeTab === "users",
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const projectsQuery = useQuery({
    queryKey: ADMIN_PROJECTS_QUERY_KEY,
    queryFn: async () =>
      normalizeProjectsResponse(await adminAPI.getProjects()),
    enabled: activeTab === "projects",
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const reportsQuery = useQuery({
    queryKey: ADMIN_REPORTS_QUERY_KEY,
    queryFn: async () => normalizeListResponse(await adminAPI.getReports()),
    enabled: activeTab === "overview" || activeTab === "reports",
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const statsData = statsQuery.data || null;
  const usersData = usersQuery.data || [];
  const projectsData = projectsQuery.data?.items || [];
  const projectsPagination = projectsQuery.data?.pagination || null;
  const reportsData = reportsQuery.data || [];

  const isLoadingAny =
    statsQuery.isLoading ||
    usersQuery.isLoading ||
    projectsQuery.isLoading ||
    reportsQuery.isLoading;

  const queryFlags = {
    isStatsFetching: statsQuery.isFetching,
    isUsersFetching: usersQuery.isFetching,
    isProjectsFetching: projectsQuery.isFetching,
    isReportsFetching: reportsQuery.isFetching,
  };

  const invalidateUsersAndLogs = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: actionLogsQueryKey }),
    ]);
  };

  const invalidateProjectsAndLogs = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: actionLogsQueryKey }),
    ]);
  };

  const setUserInUsersCache = (userId, updater) => {
    queryClient.setQueryData(ADMIN_USERS_QUERY_KEY, (prev = []) =>
      prev.map((user) => (user._id === userId ? updater(user) : user))
    );
  };

  const setProjectInProjectsCache = (projectId, updater) => {
    queryClient.setQueryData(ADMIN_PROJECTS_QUERY_KEY, (prev) => {
      if (!prev?.items) return prev;

      return {
        ...prev,
        items: prev.items.map((project) =>
          project._id === projectId ? updater(project) : project
        ),
      };
    });
  };

  const toggleBanUser = async (userId, reason) => {
    const normalizedReason = ensureReason(reason, "change user ban status");

    try {
      const response = await adminAPI.toggleBan(userId, {
        reason: normalizedReason,
      });
      const updatedUser = normalizeResponseData(response);

      setUserInUsersCache(userId, (user) => ({
        ...user,
        ...updatedUser,
      }));

      await invalidateUsersAndLogs();

      toast.success(
        updatedUser?.status === "banned"
          ? "User has been banned successfully."
          : "User has been unbanned successfully."
      );

      return updatedUser;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update ban status."));
      throw error;
    }
  };

  const toggleVerifyUser = async () => {
    const error = new Error("Verify user feature is disabled.");
    toast.error(error.message);
    throw error;
  };

  const updateUserStatus = async (userId, status, reason) => {
    const normalizedReason = ensureReason(reason, "update user status");

    try {
      const response = await adminAPI.updateUserStatus(
        userId,
        status,
        normalizedReason
      );
      const updatedUser = normalizeResponseData(response);

      setUserInUsersCache(userId, (user) => ({
        ...user,
        ...updatedUser,
      }));

      await invalidateUsersAndLogs();

      toast.success("User status updated successfully.");
      return updatedUser;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update user status."));
      throw error;
    }
  };

  const updateProjectStatus = async (projectId, payloadOrStatus) => {
  const previousProjects = queryClient.getQueryData(ADMIN_PROJECTS_QUERY_KEY);

  const requestPayload =
    typeof payloadOrStatus === "string"
      ? { status: payloadOrStatus }
      : payloadOrStatus || {};

  const optimisticStatus = requestPayload.status;

  setProjectInProjectsCache(projectId, (project) => ({
    ...project,
    status: optimisticStatus || project.status,
  }));

  try {
    const response = await adminAPI.updateProjectStatus(
      projectId,
      requestPayload
    );
    const updatedProject = normalizeResponseData(response);

    setProjectInProjectsCache(projectId, (project) => ({
      ...project,
      ...updatedProject,
    }));

    await Promise.all([
      invalidateProjectsAndLogs(),

      queryClient.invalidateQueries({
        queryKey: ["project", "detail", projectId],
      }),

      queryClient.invalidateQueries({
        queryKey: ["project"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["volunteer-engagement", "project-reviews", projectId],
      }),

      queryClient.invalidateQueries({
        queryKey: ["volunteer-applications", projectId],
      }),
    ]);

    toast.success("Project status updated successfully.");
    return updatedProject;
  } catch (error) {
    if (previousProjects !== undefined) {
      queryClient.setQueryData(ADMIN_PROJECTS_QUERY_KEY, previousProjects);
    }

    toast.error(getErrorMessage(error, "Failed to update project status."));
    throw error;
  }
};

  const handleResolveReport = async (
    reportId,
    actions = ["mark_resolved"],
    note = "No note provided"
  ) => {
    const previousReports = queryClient.getQueryData(ADMIN_REPORTS_QUERY_KEY);

    try {
      await adminAPI.resolveReport(reportId, actions, note);

      queryClient.setQueryData(ADMIN_REPORTS_QUERY_KEY, (prev = []) =>
        prev.map((report) =>
          report._id === reportId
            ? {
                ...report,
                status: "resolved",
                action:
                  Array.isArray(actions) && actions.length > 0
                    ? actions.join(",")
                    : "mark_resolved",
                decision_note: note,
                reviewed_at: new Date().toISOString(),
              }
            : report
        )
      );

      await queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_QUERY_KEY });

      toast.success("Report resolved successfully.");
      return true;
    } catch (error) {
      if (previousReports !== undefined) {
        queryClient.setQueryData(ADMIN_REPORTS_QUERY_KEY, previousReports);
      }

      toast.error(getErrorMessage(error, "Failed to resolve report."));
      throw error;
    }
  };

  const refresh = async () => {
    if (activeTab === "overview") {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_QUERY_KEY }),
      ]);
      return;
    }

    if (activeTab === "users") {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      return;
    }

    if (activeTab === "projects") {
      await invalidateProjectsAndLogs();
      return;
    }

    if (activeTab === "reports") {
      await queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_QUERY_KEY });
    }
  };

  const dashboardState = useMemo(
    () => ({
      stats: statsData,
      users: usersData,
      projects: projectsData,
      projectsPagination,
      reports: reportsData,
      loading: isLoadingAny,
      ...queryFlags,
    }),
    [
      statsData,
      usersData,
      projectsData,
      projectsPagination,
      reportsData,
      isLoadingAny,
      queryFlags.isStatsFetching,
      queryFlags.isUsersFetching,
      queryFlags.isProjectsFetching,
      queryFlags.isReportsFetching,
    ]
  );

  const dashboardActions = useMemo(
    () => ({
      toggleBanUser,
      toggleVerifyUser,
      updateUserStatus,
      updateProjectStatus,
      handleResolveReport,
      refresh,
    }),
    [activeTab]
  );

  return useMemo(
    () => ({
      ...dashboardState,
      ...dashboardActions,
    }),
    [dashboardState, dashboardActions]
  );
};

export default useAdminDashboard;