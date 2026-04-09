import httpClient, { getErrorMessage } from "@/shared/lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const organizerRequestAPI = {
  async getMyLatestRequest() {
    const res = await httpClient.get("/organizer-requests/me");
    return unwrap(res)?.request ?? null;
  },

  async submitRequest(payload) {
    const res = await httpClient.post("/organizer-requests", payload);
    return unwrap(res)?.request ?? null;
  },

  async verifyDeposit(requestId, payload) {
    const res = await httpClient.post(`/organizer-requests/${requestId}/verify-deposit`, payload);
    return unwrap(res)?.request ?? null;
  }
};

export { getErrorMessage };
export default organizerRequestAPI;