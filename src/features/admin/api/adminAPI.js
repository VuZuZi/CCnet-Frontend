import httpClient from "@/shared/lib/httpClient";

export const adminAPI = {
  getStats: () => httpClient.get("/admin/stats"),

  getUsers: (params = {}) => httpClient.get("/admin/users", { params }),

  getUserDetail: (userId) => httpClient.get(`/admin/users/${userId}`),

  toggleBan: (userId, payload = {}) =>
    httpClient.patch(`/admin/users/${userId}/ban`, payload),

  updateUserStatus: (userId, status, reason = "") =>
    httpClient.patch(`/admin/users/${userId}/status`, {
      status,
      ...(reason ? { reason } : {}),
    }),

  getActionLogs: (params = {}) =>
    httpClient.get("/admin/action-logs", { params }),

  getProjects: (params = {}) => httpClient.get("/admin/projects", { params }),

  getProjectDetail: (id) => httpClient.get(`/admin/projects/${id}`),

  updateProjectStatus: (id, payload) =>
    httpClient.patch(`/admin/projects/${id}/status`, payload),

  getReports: () => httpClient.get("/admin/reports"),

  getRefundRequests: (params = {}) =>
    httpClient.get("/transactions/admin/refund-requests", { params }),

  approveRefundRequest: (id, payload = {}) =>
    httpClient.patch(`/transactions/admin/refund-requests/${id}/approve`, payload),

  rejectRefundRequest: (id, payload = {}) =>
    httpClient.patch(`/transactions/admin/refund-requests/${id}/reject`, payload),

  resolveReport: (reportId, actions, note) =>
    httpClient.patch(`/admin/reports/${reportId}/resolve`, { actions, note }),

  createNotification: (payload) =>
    httpClient.post("/admin/notifications", payload),

  getNotificationHistory: (params = {}) =>
    httpClient.get("/admin/action-logs", {
      params: {
        ...params,
        targetType: "system_notification",
        action: "SEND_SYSTEM_NOTIFICATION",
      },
    }),
};

export default adminAPI;