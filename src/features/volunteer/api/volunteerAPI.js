import httpClient from "@/shared/lib/httpClient";

function unwrapData(response) {
  return response?.data?.data;
}

function buildProjectApplicationsUrl(projectId, status = null) {
  if (!projectId) return null;
  return status
    ? `/volunteer/projects/${projectId}/${status}`
    : `/volunteer/projects/${projectId}`;
}

function ensureApplicationId(applicationId) {
  if (!applicationId) {
    throw new Error("Thiếu mã đơn đăng ký.");
  }
}

async function get(url, config = {}) {
  const response = await httpClient.get(url, config);
  return unwrapData(response);
}

async function post(url, data = {}, config = {}) {
  const response = await httpClient.post(url, data, config);
  return unwrapData(response);
}

async function patch(url, data = {}, config = {}) {
  const response = await httpClient.patch(url, data, config);
  return unwrapData(response);
}

export const volunteerAPI = {
  async getProjectApplications(projectId, status = null) {
    const url = buildProjectApplicationsUrl(projectId, status);

    if (!url) {
      return { data: [] };
    }

    try {
      return await get(url);
    } catch (error) {
      if (error?.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async getProjectPendingApplications(projectId) {
    return this.getProjectApplications(projectId, "PENDING");
  },

  async getMySupportedProjects(params = {}) {
    return get("/volunteer/me/projects", { params });
  },

  async getApplicationByProject(projectId) {
    if (!projectId) {
      return null;
    }

    try {
      return await get("/volunteer/application", {
        params: { opportunityId: projectId },
      });
    } catch (error) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createApplication(data) {
    return post("/volunteer/submit", data);
  },

  async approveApplication(applicationId) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/${applicationId}/approve`);
  },

  async rejectApplication(applicationId, reason) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/applications/${applicationId}/reject`, {
      rejectReason: reason,
    });
  },

  async updateApplication(applicationId, data) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/applications/${applicationId}`, data);
  },

  async restoreApplication(applicationId) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/applications/${applicationId}/restore`);
  },

  async cancelApplication(applicationId) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/applications/${applicationId}/cancel`);
  },

  async requestWithdraw(applicationId, withdrawReason) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/applications/${applicationId}/request-withdraw`, {
      withdrawReason,
    });
  },

  async approveWithdraw(applicationId) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/applications/${applicationId}/approve-withdraw`);
  },

  async rejectWithdraw(applicationId, reviewNote) {
    ensureApplicationId(applicationId);
    return patch(`/volunteer/applications/${applicationId}/reject-withdraw`, {
      reviewNote,
    });
  },
};

export default volunteerAPI;
