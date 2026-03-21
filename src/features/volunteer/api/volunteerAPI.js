import httpClient from '@/shared/lib/httpClient';

export const volunteerAPI = {
  create: async (data) => {
    const response = await httpClient.post('/', data);
    return response.data?.data;
  },

  updateDraft: async ({ id, data }) => {
    const payload = prepareVolunteerPayload(data);
    const response = await httpClient.put(`/volunteer/${id}/draft`, payload);
    return response.data?.data;
  },

  submitForApproval: async (id) => {
    const response = await httpClient.post(`/volunteer/${id}/submit`);
    return response.data?.data;
  },

  getFeatured: async () => {
    const response = await httpClient.get('/volunteer/featured');
    return response.data?.data;
  },

  getExplore: async (params) => {
    const response = await httpClient.get('/volunteer/explore', { params });
    return response.data?.data;
  },

  getDetail: async (id) => {
    const response = await httpClient.get(`/volunteer/${id}`);
    return response.data?.data;
  },
  getMyVolunteers: async () => {
    const response = await httpClient.get('/volunteer/organizer/my-volunteers');
    return response.data?.data;
  }
};

export const volunteerApi = {
// Tạo đơn đăng ký mới
  createApplication: async (data) => {
    const payload = sanitizeApplicationPayload(data);
    const response = await httpClient.post('/volunteer-applications', payload);
    return response.data?.data;
  },
  
  // Lấy danh sách đơn đăng ký của user hiện tại
  getMyApplications: async (params) => {
    const response = await httpClient.get('/volunteer-applications/my-applications', { params });
    return response.data?.data;
  },
  
  // Lấy chi tiết một đơn đăng ký
  getApplicationDetail: async (id) => {
    const response = await httpClient.get(`/volunteer-applications/${id}`);
    return response.data?.data;
  },
  
  // Cập nhật đơn đăng ký
  updateApplication: async ({ id, data }) => {
    const payload = sanitizeApplicationPayload(data);
    const response = await httpClient.put(`/volunteer-applications/${id}`, payload);
    return response.data?.data;
  },
  
  // Hủy đơn đăng ký
  cancelApplication: async (id) => {
    const response = await httpClient.delete(`/volunteer-applications/${id}`);
    return response.data?.data;
  },
  
  // Lấy danh sách ứng viên cho một volunteer (dành cho organizer)
  getVolunteerApplications: async (volunteerId, params) => {
    const response = await httpClient.get(`/volunteers/${volunteerId}/applications`, { params });
    return response.data?.data;
  },
  
  // Xét duyệt đơn đăng ký (organizer)
  reviewApplication: async ({ applicationId, status, feedback }) => {
    const response = await httpClient.patch(`/volunteer-applications/${applicationId}/review`, {
      status,
      feedback
    });
    return response.data?.data;
  }
}