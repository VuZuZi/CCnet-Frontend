import httpClient from '@/shared/lib/httpClient';

const unwrap = (payload) => payload?.data ?? payload;

export const followAPI = {
  async followUser(userId) {
    const res = await httpClient.post(`/follow/users/${userId}`);
    return unwrap(res.data);
  },

  async unfollowUser(userId) {
    const res = await httpClient.delete(`/follow/users/${userId}`);
    return unwrap(res.data);
  },

  async statusUser(userId) {
    const res = await httpClient.get(`/follow/users/${userId}/status`);
    return unwrap(res.data);
  },

  async statsUser(userId) {
    const res = await httpClient.get(`/follow/users/${userId}/stats`);
    return unwrap(res.data);
  },

  async getMyFollowing(limit = 50) {
    const res = await httpClient.get('/follow/following', { params: { limit } });
    return unwrap(res.data);
  },
};
