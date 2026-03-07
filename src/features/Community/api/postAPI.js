import httpClient from "@/shared/lib/httpClient";

export const postAPI = {
  getPosts: async ({ cursor = null, limit = 10 }) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    
    const res = await httpClient.get("/posts", { params });
    return res.data; 
  },

  getPostById: async (id) => {
    const res = await httpClient.get(`/posts/${id}`);
    return res.data;
  },

  createPost: async (formData) => {
    const res = await httpClient.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  toggleReaction: async (postId, type) => {
    const res = await httpClient.post(`/posts/${postId}/reaction`, { type });
    return res.data;
  },

  addComment: async (postId, content) => {
    const res = await httpClient.post(`/posts/${postId}/comments`, { content });
    return res.data;
  },

  reportPost: async (postId, formData) => {
    const res = await httpClient.post(`/posts/${postId}/report`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};