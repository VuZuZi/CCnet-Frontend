import httpClient, { getErrorMessage } from "@/shared/lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const organizerRequestAdminAPI = {
  async getRequests(params = {}) {
    const res = await httpClient.get("/admin/organizer-requests", { params });
    return unwrap(res);
  },

  async getRequestDetail(id) {
    const res = await httpClient.get(`/admin/organizer-requests/${id}`);
    return unwrap(res)?.request ?? null;
  },

  async approveRequest(id, payload) {
    const res = await httpClient.patch(
      `/admin/organizer-requests/${id}/approve`,
      payload
    );
    return unwrap(res)?.request ?? null;
  },

  async declineRequest(id, payload) {
    const res = await httpClient.patch(
      `/admin/organizer-requests/${id}/decline`,
      payload
    );
    return unwrap(res)?.request ?? null;
  },

  async getActionLogs(params = {}) {
    const res = await httpClient.get("/admin/organizer-requests/logs", {
      params,
    });
    return unwrap(res);
  },

  async runMockVerification(id) {
    const res = await httpClient.post(
      `/admin/organizer-requests/${id}/verification-checks/mock`
    );
    return unwrap(res)?.check ?? null;
  },

  async listVerificationChecks(id) {
    const res = await httpClient.get(
      `/admin/organizer-requests/${id}/verification-checks`
    );
    return unwrap(res)?.checks ?? [];
  },
};

export { getErrorMessage };