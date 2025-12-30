import httpClient from '@/shared/lib/httpClient';

export const postAPI = {
  getPosts: () => httpClient.get('/posts'),
  getPostById: (id) => httpClient.get(`/posts/${id}`),
  createPost: (data) => httpClient.post('/posts', data),
}