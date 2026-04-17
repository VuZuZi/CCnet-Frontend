import httpClient from '@/shared/lib/httpClient';

const sanitizeMediaPayload = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return [];

  return mediaArray
    .map((media) => {
      const cleanMedia = {
        _id: media._id || undefined,
        url: media.url || undefined,
        publicId: media.publicId || undefined,
        originalName: media.originalName || undefined,
        mimetype: media.mimetype || undefined,
        size: media.size ? Number(media.size) : undefined,
      };

      Object.keys(cleanMedia).forEach((key) => {
        if (cleanMedia[key] === undefined) {
          delete cleanMedia[key];
        }
      });

      return cleanMedia;
    })
    .filter((media) => media._id || (media.url && media.publicId));
};

const cleanEmptyStrings = (obj) => {
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) return obj.map(cleanEmptyStrings);
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, cleanEmptyStrings(v)])
        .filter(([_, v]) => v !== "")
    );
  }
  
  return obj;
};

const prepareProjectPayload = (data) => {
  let payload = { ...data };

  if (payload.coverMedia) payload.coverMedia = sanitizeMediaPayload(payload.coverMedia);
  if (payload.documents) payload.documents = sanitizeMediaPayload(payload.documents);

  if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
  if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();

  if (payload.milestones && Array.isArray(payload.milestones)) {
    payload.milestones = payload.milestones.map(m => {
      const cleanedMilestone = { ...m };
      
      if (!cleanedMilestone.location || !cleanedMilestone.location.coordinates || cleanedMilestone.location.coordinates.length === 0) {
        delete cleanedMilestone.location;
      }
      delete cleanedMilestone.evidencePolicy;
      
      if (cleanedMilestone.startDate) cleanedMilestone.startDate = new Date(cleanedMilestone.startDate).toISOString();
      if (cleanedMilestone.endDate) cleanedMilestone.endDate = new Date(cleanedMilestone.endDate).toISOString();
      if (cleanedMilestone.targetAmount) cleanedMilestone.targetAmount = Number(cleanedMilestone.targetAmount);

      return cleanedMilestone;
    });
  }

  let finalPayload = cleanEmptyStrings(payload);
  
  if (Array.isArray(data.deletedDocumentIds)) {
      finalPayload.deletedDocumentIds = data.deletedDocumentIds;
  }
  if (Array.isArray(data.volunteerRoles) && data.volunteerRoles.length === 0) {
      finalPayload.volunteerRoles = [];
  }

  return finalPayload;
};

export const projectAPI = {
  createDraft: async (data) => {
    const payload = prepareProjectPayload(data);
    delete payload.deletedDocumentIds;

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

  getVolunteerNeeded: async () => {
    const response = await httpClient.get('/project/volunteers-needed');
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

  getWorkspaceProjects: async (params = {}) => {
    const response = await httpClient.get('/project/organizer/my-projects', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        status: params.status ?? 'ALL',
      },
    });
    return response.data?.data;
  },

  getFeedPosts: async (projectId, { limit = 10, cursor = null } = {}) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    const response = await httpClient.get(`/project/${projectId}/feed/posts`, { params });
    return response.data?.data;
  },

  createFeedPost: async (projectId, data) => {
    const response = await httpClient.post(`/project/${projectId}/feed/posts`, data);
    return response.data?.data;
  },

  createFeedComment: async (projectId, postId, data) => {
    const response = await httpClient.post(`/project/${projectId}/feed/posts/${postId}/comments`, data);
    return response.data?.data;
  },

  reportProject: async (projectId, payload) => {
    const response = await httpClient.post(`/project/${projectId}/report`, payload);
    return response.data?.data;
  },

  toggleFeedPostLike: async (projectId, postId) => {
    const response = await httpClient.post(`/project/${projectId}/feed/posts/${postId}/like`);
    return response.data?.data;
  },

  toggleFeedCommentLike: async (projectId, commentId) => {
    const response = await httpClient.post(`/project/${projectId}/feed/comments/${commentId}/like`);
    return response.data?.data;
  },
};