import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../api/adminAPI";

export const ADMIN_PROJECTS_QUERY_KEY = ["project-management", "projects"];

export const useAdminDashboard = (activeTab) => {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await adminAPI.getStats();
      return res?.data?.data || res?.data || null;
    },
    enabled: activeTab === "overview",
    refetchOnWindowFocus: false,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await adminAPI.getUsers();
      return res?.data?.data || [];
    },
    enabled: activeTab === "users",
    refetchOnWindowFocus: false,
  });

  const projectsQuery = useQuery({
    queryKey: ADMIN_PROJECTS_QUERY_KEY,
    queryFn: async () => {
      const res = await adminAPI.getProjects();
      return res?.data?.data || [];
    },
    enabled: activeTab === "projects",
    refetchOnWindowFocus: false,
  });

  const reportsQuery = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const res = await adminAPI.getReports();
      return res?.data?.data || [];
    },
    enabled: activeTab === "overview" || activeTab === "reports",
    refetchOnWindowFocus: false,
  });

  const toggleBanUser = async (userId) => {
    const res = await adminAPI.toggleBan(userId);
    const updatedUser = res?.data?.data;

    queryClient.setQueryData(["admin", "users"], (prev = []) =>
      prev.map((user) =>
        user._id === userId ? { ...user, ...updatedUser } : user
      )
    );
  };

  const toggleVerifyUser = async (userId, isVerified) => {
    const res = await adminAPI.toggleVerified(userId, isVerified);
    const updatedUser = res?.data?.data;

    queryClient.setQueryData(["admin", "users"], (prev = []) =>
      prev.map((user) =>
        user._id === userId ? { ...user, ...updatedUser } : user
      )
    );
  };

  const updateUserStatus = async (userId, status) => {
    const res = await adminAPI.updateUserStatus(userId, status);
    const updatedUser = res?.data?.data;

    queryClient.setQueryData(["admin", "users"], (prev = []) =>
      prev.map((user) =>
        user._id === userId ? { ...user, ...updatedUser } : user
      )
    );

    return updatedUser;
  };

const updateProjectStatus = async (projectId, payloadOrStatus) => {
    const previousProjects = queryClient.getQueryData(ADMIN_PROJECTS_QUERY_KEY);

    const requestPayload = typeof payloadOrStatus === 'string' 
      ? { status: payloadOrStatus } 
      : payloadOrStatus;

    const optimisticStatus = requestPayload.status;

    queryClient.setQueryData(ADMIN_PROJECTS_QUERY_KEY, (prev = []) =>
      prev.map((project) =>
        project._id === projectId ? { ...project, status: optimisticStatus } : project
      )
    );

    let updatedProject;
    try {
      const res = await adminAPI.updateProjectStatus(projectId, requestPayload);
      updatedProject = res?.data?.data;

      queryClient.setQueryData(ADMIN_PROJECTS_QUERY_KEY, (prev = []) =>
        prev.map((project) =>
          project._id === projectId ? { ...project, ...updatedProject } : project
        )
      );

      // queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
    } catch (error) {
      if (previousProjects !== undefined) {
        queryClient.setQueryData(ADMIN_PROJECTS_QUERY_KEY, previousProjects);
      }
      throw error;
    }

    return updatedProject;
  };

  const deleteProject = async (projectId) => {
    await adminAPI.deleteProject(projectId);

    queryClient.setQueryData(ADMIN_PROJECTS_QUERY_KEY, (prev = []) =>
      prev.filter((project) => project._id !== projectId)
    );
  };

  const handleResolveReport = async (reportId, actions, note) => {
    await adminAPI.resolveReport(reportId, actions, note);

    queryClient.setQueryData(["admin", "reports"], (prev = []) =>
      prev.filter((report) => report._id !== reportId)
    );
  };

  const refresh = async () => {
    if (activeTab === "overview") {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "stats"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "reports"] }),
      ]);
      return;
    }

    if (activeTab === "users") {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      return;
    }

    if (activeTab === "projects") {
      await queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      return;
    }

    if (activeTab === "reports") {
      await queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    }
  };

  return {
    stats: statsQuery.data || null,
    users: usersQuery.data || [],
    projects: projectsQuery.data || [],
    reports: reportsQuery.data || [],
    loading:
      statsQuery.isLoading ||
      usersQuery.isLoading ||
      projectsQuery.isLoading ||
      reportsQuery.isLoading,

    toggleBanUser,
    toggleVerifyUser,
    updateUserStatus,
    updateProjectStatus,
    deleteProject,
    handleResolveReport,
    refresh,
  };
};