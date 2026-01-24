import httpClient from '@/shared/lib/httpClient';

const ENDPOINTS = {
  PROFILE: '/user',
  CHANGE_AVATAR: '/user/avatar' 
};

export const userAPI = {
  async getProfile() {
    const res = await httpClient.get(ENDPOINTS.PROFILE);
    return res.data.data.user;
  },
  async updateProfile(payload) {
    const res = await httpClient.put(ENDPOINTS.PROFILE, payload);
    return res.data.data.user;
  },

  async changeAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file); 

    const res = await httpClient.put(ENDPOINTS.CHANGE_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return res.data.data.user;
  },
  async changePassword(payload) {
    const res = await httpClient.put('/user/password', payload);
    return res.data.data.user;
  },
};

export default userAPI;
