import { useQuery } from "@tanstack/react-query";
import { volunteerAPI } from "../api/volunteerAPI";

export const volunteerQueryKeys = {
  all: ["volunteer"],
  applicationRoot: ["volunteer-application"],
  projectApplicationsRoot: ["project-applications"],
  pendingApplicationsRoot: ["pending-applications"],
  supportedProjectsRoot: ["volunteer", "supported-projects"],

  application: (projectId, userId) => [
    "volunteer-application",
    projectId || null,
    userId || null,
  ],

  projectApplications: (projectId, status = null) => [
    "project-applications",
    projectId || null,
    status || null,
  ],

  pendingApplications: (projectId) => [
    "pending-applications",
    projectId || null,
  ],

  supportedProjects: (params = {}) => [
    "volunteer",
    "supported-projects",
    {
      view: params?.view || "ALL",
      search: params?.search || "",
      page: Number(params?.page || 1),
      limit: Number(params?.limit || 12),
    },
  ],
};

export const useVolunteerQueries = () => {
  const useProjectApplications = (projectId, status = null) => {
    return useQuery({
      queryKey: volunteerQueryKeys.projectApplications(projectId, status),
      queryFn: () => volunteerAPI.getProjectApplications(projectId, status),
      enabled: Boolean(projectId),
    });
  };

  const useProjectPendingApplications = (projectId) => {
    return useQuery({
      queryKey: volunteerQueryKeys.pendingApplications(projectId),
      queryFn: () => volunteerAPI.getProjectPendingApplications(projectId),
      enabled: Boolean(projectId),
    });
  };

  const useApplicationStatus = (projectId, userId) => {
    return useQuery({
      queryKey: volunteerQueryKeys.application(projectId, userId),
      queryFn: () => volunteerAPI.getApplicationByProject(projectId),
      enabled: Boolean(projectId && userId),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    });
  };

  const useMySupportedProjects = (params = {}) => {
    return useQuery({
      queryKey: volunteerQueryKeys.supportedProjects(params),
      queryFn: () => volunteerAPI.getMySupportedProjects(params),
    });
  };

  return {
    useProjectApplications,
    useProjectPendingApplications,
    useApplicationStatus,
    useMySupportedProjects,
  };
};

export default useVolunteerQueries;