import httpClient from '@/shared/lib/httpClient';

const sanitizeQueryParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== undefined && value !== null
    )
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

  getMap: async (params = {}) => {
    const response = await httpClient.get('/help-requests/map', {
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

  verify: async ({ id, approved, rejectionReason }) => {
    const payload = { approved };

    if (
      approved === false &&
      typeof rejectionReason === 'string' &&
      rejectionReason.trim()
    ) {
      payload.rejectionReason = rejectionReason.trim();
    }

    const response = await httpClient.patch(
      `/help-requests/${id}/verify`,
      payload
    );

    return response.data?.data;
  },

  getOrganizerSuggestions: async (id, params = {}) => {
    const response = await httpClient.get(
      `/help-requests/${id}/organizer-suggestions`,
      {
        params: sanitizeQueryParams(params),
      }
    );
    return response.data?.data;
  },

  assignOrganizer: async ({ id, organizerId }) => {
    const response = await httpClient.patch(`/help-requests/${id}/assign`, {
      organizerId,
    });
    return response.data?.data;
  },

  getOrganizerAssigned: async (params = {}) => {
    const response = await httpClient.get('/help-requests/organizer/assigned', {
      params: sanitizeQueryParams(params),
    });
    return response.data?.data;
  },

  respondAssignment: async ({ id, action }) => {
    const response = await httpClient.patch(
      `/help-requests/${id}/assignment-response`,
      {
        action,
      }
    );
    return response.data?.data;
  },

  getAsProjectData: async (id) => {
    const response = await httpClient.get(`/help-requests/${id}/as-project`);
    return response.data?.data;
  },
};

export default helpRequestAPI;