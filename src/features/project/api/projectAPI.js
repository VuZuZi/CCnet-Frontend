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

  toggleFeedPostLike: async (projectId, postId) => {
    const response = await httpClient.post(`/project/${projectId}/feed/posts/${postId}/like`);
    return response.data?.data;
  },

  toggleFeedCommentLike: async (projectId, postId, commentId) => {
    const response = await httpClient.post(`/project/${projectId}/feed/posts/${postId}/comments/${commentId}/like`);
    return response.data?.data;
  },
};