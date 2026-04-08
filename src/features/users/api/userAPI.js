import httpClient from "@/shared/lib/httpClient";

export const userAPI = {
  async getProfile(userId = null) {
    const cleanId = userId ? String(userId).trim() : null;
    const url = cleanId ? `/user/${cleanId}` : "/user";

    const response = await httpClient.get(url);
    return response.data?.data?.user;
  },

  async updateProfile(data) {
    const response = await httpClient.put("/user", data);
    return response.data?.data?.user;
  },

  async updateAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await httpClient.put("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data?.user;
  },

  async updateCoverPhoto(file) {
    const formData = new FormData();
    formData.append("coverPhoto", file);

    const response = await httpClient.put("/user/cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data?.user;
  },

  async reportUser(userId, payload) {
    const response = await httpClient.post(`/user/${userId}/report`, payload);
    return response.data?.data;
  },

  async getSuggestedUsers(limit = 5) {
    const response = await httpClient.get("/user/suggested", {
      params: { limit },
    });

    return response.data?.data || response.data;
  },
};
