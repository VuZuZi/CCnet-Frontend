import httpClient from "@/shared/lib/httpClient";

export const adminAPI = {
  getStats: () => httpClient.get("/admin/stats"),
  getUsers: (params = {}) => httpClient.get("/admin/users", { params }),
  toggleBan: (userId) => httpClient.patch(`/admin/users/${userId}/ban`),
  toggleVerified: (userId, isVerified) =>
    httpClient.patch(`/admin/users/${userId}/verify`, { isVerified }),
  updateUserStatus: (userId, status) =>
    httpClient.patch(`/admin/users/${userId}/status`, { status }),
  getProjects: () => httpClient.get("/admin/projects"),

  updateProjectStatus: (id, payload) =>
    httpClient.patch(`/admin/projects/${id}/status`, payload),

  deleteProject: (id) => httpClient.delete(`/admin/projects/${id}`),
  getReports: () => httpClient.get("/admin/reports"),
  resolveReport: (reportId, actions, note) =>
    httpClient.patch(`/admin/reports/${reportId}/resolve`, { actions, note }),
  createNotification: (payload) =>
    httpClient.post("/admin/notifications", payload),
};

export default adminAPI;