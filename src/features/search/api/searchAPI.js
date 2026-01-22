import httpClient from '@/shared/lib/httpClient';

const unwrap = (payload) => payload?.data ?? payload;

export const searchAPI = {
  async globalSearch(params) {
    const res = await httpClient.get('/search', { params });
    return unwrap(res.data);
  },
};
