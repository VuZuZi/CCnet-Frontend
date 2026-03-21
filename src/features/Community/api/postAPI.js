import httpClient from "@/shared/lib/httpClient";

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const postAPI = {
  getPosts: async (params = { limit: 10 }) => {
    const { data } = await httpClient.get("/posts", { params });
    return data;
  },

  getPostById: async (id) => {
    const { data } = await httpClient.get(`/posts/${id}`);
    return data;
  },

  createPost: async (formData) => {
    const { data } = await httpClient.post("/posts", formData, multipartConfig);
    return data;
  },

  updatePost: async (postId, formData) => {
    const { data } = await httpClient.patch(
      `/posts/${postId}`,
      formData,
      multipartConfig,
    );
    return data;
  },

  deletePost: async (postId) => {
    const { data } = await httpClient.delete(`/posts/${postId}`);
    return data;
  },

  toggleReaction: async (postId, type) => {
    const { data } = await httpClient.post(`/posts/${postId}/reaction`, {
      type,
    });
    return data;
  },

  addComment: async (postId, content) => {
    const { data } = await httpClient.post(`/posts/${postId}/comments`, {
      content,
    });
    return data;
  },

  reportPost: async (postId, formData) => {
    const { data } = await httpClient.post(
      `/posts/${postId}/report`,
      formData,
      multipartConfig,
    );
    return data;
  },
};
