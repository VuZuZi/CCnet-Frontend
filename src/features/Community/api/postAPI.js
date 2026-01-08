import httpClient from '@/shared/lib/httpClient'

export const postAPI = {
  getPosts: () => httpClient.get('/posts'),
  getPostById: (id) => httpClient.get(`/posts/${id}`),
  
  // FIXED: Removed forced multipart headers
  createPost: (data) => httpClient.post('/posts', data),
  
  toggleLike: (postId) => httpClient.post(`/posts/${postId}/like`),
  toggleDislike: (postId) => httpClient.post(`/posts/${postId}/dislike`),
  addComment: (postId, content) =>
    httpClient.post(`/posts/${postId}/comment`, { content }),
}