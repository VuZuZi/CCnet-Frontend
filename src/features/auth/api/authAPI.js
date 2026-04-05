import httpClient from '@/shared/lib/httpClient';

let refreshTokenPromise = null;

export const authAPI = {
  async register(data) {
    const response = await httpClient.post('/auth/register', data);
    return response.data;
  },

  async verifyOTP(data) {
    const response = await httpClient.post('/auth/verify-otp', data);
    return response.data;
  },

  async resendOTP(email) {
    const response = await httpClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  async login(credentials) {
    const response = await httpClient.post('/auth/login', credentials);
    return response.data;
  },

  async loginWithGoogle(payload) {
    const response = await httpClient.post('/auth/google', payload);
    return response.data;
  },

  async logout() {
    const response = await httpClient.post('/auth/logout');
    return response.data;
  },

  async logoutAll() {
    const response = await httpClient.post('/auth/logout-all');
    return response.data;
  },

  async refreshToken() {
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }

    refreshTokenPromise = httpClient.post('/auth/refresh-token')
      .then((response) => response.data)
      .finally(() => {
        refreshTokenPromise = null;
      });

    return refreshTokenPromise;
  },

  async getMe() {
    const response = await httpClient.get('/auth/me');
    return response.data.data.user;
  },
};