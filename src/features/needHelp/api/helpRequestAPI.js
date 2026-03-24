import httpClient from '@/shared/lib/httpClient';

const sanitizeQueryParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );

export const helpRequestAPI = {
  getAll: async (params = {}) => {
    const response = await httpClient.get('/help-requests', {
      params: sanitizeQueryParams(params),
    });
    return response.data?.data;
  },

  getUrgent: async (params = {}) => {
    const response = await httpClient.get('/help-requests/urgent', {
      params: sanitizeQueryParams(params),
    });
    return response.data?.data;
  },

  getNearby: async (params) => {
    const response = await httpClient.get('/help-requests/nearby', {
      params: sanitizeQueryParams(params),
    });
    return response.data?.data;
  },

  getMyRequests: async (params = {}) => {
    const response = await httpClient.get('/help-requests/user/my-requests', {
      params: sanitizeQueryParams(params),
    });
    return response.data?.data;
  },

  getById: async (id) => {
    const response = await httpClient.get(`/help-requests/${id}`);
    return response.data?.data;
  },

  create: async (data) => {
    const response = await httpClient.post('/help-requests', data);
    return response.data?.data;
  },

  update: async ({ id, data }) => {
    const response = await httpClient.put(`/help-requests/${id}`, data);
    return response.data?.data;
  },

  delete: async (id) => {
    const response = await httpClient.delete(`/help-requests/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await httpClient.patch(`/help-requests/${id}/cancel`);
    return response.data?.data;
  },

  complete: async (id) => {
    const response = await httpClient.patch(`/help-requests/${id}/complete`);
    return response.data?.data;
  },
};
