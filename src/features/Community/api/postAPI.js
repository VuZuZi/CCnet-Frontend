import httpClient from "@/shared/lib/httpClient";

export const postAPI = {
  getPosts: (params = {}) => httpClient.get("/posts", { params }),

  getPostById: (id) => httpClient.get(`/posts/${id}`),

  createPost: (data) => httpClient.post("/posts", data),

  toggleLike: (postId) => httpClient.post(`/posts/${postId}/like`),

  toggleDislike: (postId) => httpClient.post(`/posts/${postId}/dislike`),

  addComment: (postId, content) =>
    httpClient.post(`/posts/${postId}/comment`, { content }),

  reportPost: (postId, payload) =>
    httpClient.post(`/posts/${postId}/report`, payload),
};
