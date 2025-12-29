import httpClient from '@/shared/lib/httpClient';

export const userAPI = {
  async getProfile() {
    const res = await httpClient.get('/user');
    return res.data.data.user;
  },
  async updateProfile(payload) {
    const res = await httpClient.put('/user', payload);
    return res.data.data.user;
  },
  async changePassword(payload) {
    const res = await httpClient.put('/user/password', payload);
    return res.data.data.user;
  },
};

export default userAPI;
