import httpClient from '@/shared/lib/httpClient';

export const searchAPI = {
  async globalSearch(params) {
    const res = await httpClient.get('/search', { params });
    return res?.data?.data ?? res?.data ?? res ?? {};
  },
};

export default searchAPI;