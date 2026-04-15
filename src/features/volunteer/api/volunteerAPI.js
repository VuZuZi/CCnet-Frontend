import httpClient from "@/shared/lib/httpClient";

export const volunteerAPI = {
  getProjectApplications: async (projectId, status) => {
    if (!projectId) {
      return { data: [] };
    }

    try {
      const url = `/volunteer/projects/${projectId}/${status}`;
      const params = {};
      if (status) params.status = status;

      const response = await httpClient.get(url, { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  getProjectPendingApplications: async (projectId) => {
    return volunteerAPI.getProjectApplications(projectId, "PENDING");
  },

  getMySupportedProjects: async (params = {}) => {
    const response = await httpClient.get("/volunteer/me/projects", {
      params,
    });
    return response.data?.data;
  },

  getApplicationByProject: async (projectId) => {
    if (!projectId) {
      return null;
    }

    try {
      const response = await httpClient.get("/volunteer/application", {
        params: { opportunityId: projectId },
      });
      return response.data?.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createApplication: async (data) => {
    const response = await httpClient.post("/volunteer/submit", data);
    return response.data?.data;
  },

  approveApplication: async (applicationId) => {
    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    const response = await httpClient.patch(`/volunteer/${applicationId}/approve`);
    return response.data?.data;
  },

  rejectApplication: async (applicationId, reason) => {
    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    const response = await httpClient.patch(
      `/volunteer/applications/${applicationId}/reject`,
      { rejectReason: reason },
    );
    return response.data?.data;
  },

  updateApplication: async (applicationId, data) => {
    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    const response = await httpClient.patch(
      `/volunteer/applications/${applicationId}`,
      data,
    );
    return response.data?.data;
  },

  restoreApplication: async (applicationId) => {
    const response = await httpClient.patch(
      `/volunteer/applications/${applicationId}/restore`,
    );
    return response.data?.data;
  },

  cancelApplication: async (applicationId) => {
    const response = await httpClient.patch(
      `/volunteer/applications/${applicationId}/cancel`,
    );
    return response.data?.data;
  },
};