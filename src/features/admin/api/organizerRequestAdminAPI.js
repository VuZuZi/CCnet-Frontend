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

  async approveRequest(id) {
    const res = await httpClient.patch(`/admin/organizer-requests/${id}/approve`);
    return unwrap(res)?.request ?? null;
  },

  async declineRequest(id, payload) {
    const res = await httpClient.patch(
      `/admin/organizer-requests/${id}/decline`,
      payload
    );
    return unwrap(res)?.request ?? null;
  },
};

export { getErrorMessage };