import httpClient from "@/shared/lib/httpClient";

const BASE_URL = "/posts";

export const postAPI = {
  getNewsFeed: async ({ cursor, limit = 10 }) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    const response = await httpClient.get(BASE_URL, { params });
    return response.data; 
  },

  createPost: async (payload) => {
    const formData = new FormData();
    formData.append("content", payload.content);
    formData.append("privacy", payload.privacy || "public");

    if (payload.location) {
        formData.append("location", JSON.stringify(payload.location));
    }

    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await httpClient.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  toggleReaction: async ({ postId, type }) => {
    const response = await httpClient.post(`${BASE_URL}/${postId}/reaction`, { type });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await httpClient.delete(`${BASE_URL}/${postId}`);
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await httpClient.get(`${BASE_URL}/${postId}`);
    return response.data;
  },

  addComment: async ({ postId, content }) => {
    const response = await httpClient.post(`${BASE_URL}/${postId}/comments`, { content });
    return response.data;
  },

  getComments: async (postId, { page = 1 }) => {
    const response = await httpClient.get(`${BASE_URL}/${postId}/comments`, { 
        params: { page } 
    });
    return response.data;
  },

  reportPost: async (postId, reportData) => {
      const response = await httpClient.post(`${BASE_URL}/${postId}/report`, reportData);
      return response.data;
  }
};