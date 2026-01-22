import httpClient from "@/shared/lib/httpClient";

export const adminAPI = {
  getStats: () => httpClient.get("/admin/stats"),
  getUsers: () => httpClient.get("/admin/users"),
  toggleBan: (userId, reason) =>
    httpClient.patch(`/admin/users/${userId}/ban`, { reason }),
  getProjects: () => httpClient.get("/admin/projects"),
  deleteProject: (id) => httpClient.delete(`/admin/projects/${id}`),

  getReports: () => httpClient.get("/admin/reports"),
  resolveReport: (reportId, actions, note) =>
    httpClient.patch(`/admin/reports/${reportId}/resolve`, { actions, note }),

  createNotification: (data) => httpClient.post("/admin/notifications", data),
};
