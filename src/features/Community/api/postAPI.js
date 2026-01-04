import httpClient from '@/shared/lib/httpClient'

export const postAPI = {
  getPosts: () => httpClient.get('/posts'),
  getPostById: (id) => httpClient.get(`/posts/${id}`),
  createPost: (data) =>
    httpClient.post('/posts', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    toggleLike: (postId) => httpClient.post(`/posts/${postId}/like`),
  toggleDislike: (postId) => httpClient.post(`/posts/${postId}/dislike`),
  addComment: (postId, content) =>
    httpClient.post(`/posts/${postId}/comment`, { content }),
}

