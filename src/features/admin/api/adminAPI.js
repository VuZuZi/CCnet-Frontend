import httpClient from "@/shared/lib/httpClient";

export const adminAPI = {
  getStats: () => httpClient.get("/admin/stats"),

  getUsers: (params = {}) => httpClient.get("/admin/users", { params }),

  toggleBan: (userId, payload = {}) =>
    httpClient.patch(`/admin/users/${userId}/ban`, payload),

  /*
  Disabled by team request: no more Verify / Verified feature in UI
  toggleVerified: (userId, isVerified, reason = "") =>
    httpClient.patch(`/admin/users/${userId}/verify`, {
      isVerified,
      ...(reason ? { reason } : {}),
    }),
  */

  updateUserStatus: (userId, status, reason = "") =>
    httpClient.patch(`/admin/users/${userId}/status`, {
      status,
      ...(reason ? { reason } : {}),
    }),

  getActionLogs: (params = {}) =>
    httpClient.get("/admin/action-logs", { params }),

  getProjects: (params = {}) => httpClient.get("/admin/projects", { params }),

  updateProjectStatus: (id, payload) =>
    httpClient.patch(`/admin/projects/${id}/status`, payload),

  deleteProject: (id, payload = {}) =>
    httpClient.delete(`/admin/projects/${id}`, {
      data: payload,
    }),

  getReports: () => httpClient.get("/admin/reports"),

  resolveReport: (reportId, actions, note) =>
    httpClient.patch(`/admin/reports/${reportId}/resolve`, { actions, note }),

  createNotification: (payload) =>
    httpClient.post("/admin/notifications", payload),
};

export default adminAPI;