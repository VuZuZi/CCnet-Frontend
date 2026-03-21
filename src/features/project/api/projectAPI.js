import httpClient from '@/shared/lib/httpClient';


const sanitizeMediaPayload = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return [];

  return mediaArray
    .map(media => {
      const cleanMedia = {
        _id: media._id || undefined,
        url: media.url || undefined,
        publicId: media.publicId || undefined,
        originalName: media.originalName || undefined,
        mimetype: media.mimetype || undefined,
        size: media.size ? Number(media.size) : undefined
      };

      Object.keys(cleanMedia).forEach(key => {
        if (cleanMedia[key] === undefined) {
          delete cleanMedia[key];
        }
      });

      return cleanMedia;
    })
    .filter(media => media._id || (media.url && media.publicId));
};

const prepareProjectPayload = (data) => {
  const payload = { ...data };

  payload.coverMedia = sanitizeMediaPayload(data.coverMedia);
  payload.documents = sanitizeMediaPayload(data.documents);

  if (!payload.deletedDocumentIds || payload.deletedDocumentIds.length === 0) {
    delete payload.deletedDocumentIds;
  }

  if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
  if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();

  return payload;
};

// Helper function để sanitize dữ liệu application
const sanitizeApplicationPayload = (data) => {
  const payload = { ...data };
  
  // Xử lý các field đặc biệt nếu cần
  if (payload.startDate) {
    payload.startDate = new Date(payload.startDate).toISOString();
  }
  
  if (payload.endDate) {
    payload.endDate = new Date(payload.endDate).toISOString();
  }
  
  // Xóa các field undefined
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });
  
  return payload;
};

export const projectAPI = {
  createDraft: async (data) => {
    const payload = prepareProjectPayload(data);
    const response = await httpClient.post('/project', payload);
    return response.data?.data;
  },

  updateDraft: async ({ id, data }) => {
    const payload = prepareProjectPayload(data);
    const response = await httpClient.put(`/project/${id}/draft`, payload);
    return response.data?.data;
  },

  submitForApproval: async (id) => {
    const response = await httpClient.post(`/project/${id}/submit`);
    return response.data?.data;
  },

  getFeatured: async () => {
    const response = await httpClient.get('/project/featured');
    return response.data?.data;
  },

  getExplore: async (params) => {
    const response = await httpClient.get('/project/explore', { params });
    return response.data?.data;
  },

  getDetail: async (id) => {
    const response = await httpClient.get(`/project/${id}`);
    return response.data?.data;
  },
  getMyProjects: async () => {
    const response = await httpClient.get('/project/organizer/my-projects');
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
  
  // Lấy danh sách ứng viên cho một project (dành cho organizer)
  getProjectApplications: async (projectId, params) => {
    const response = await httpClient.get(`/projects/${projectId}/applications`, { params });
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