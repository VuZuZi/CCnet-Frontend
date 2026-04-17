import httpClient from "@/shared/lib/httpClient";

const toNumberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toIsoOrUndefined = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const removeUndefinedDeep = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(removeUndefinedDeep)
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, itemValue]) => [key, removeUndefinedDeep(itemValue)])
        .filter(([, itemValue]) => itemValue !== undefined),
    );
  }

  return value === undefined ? undefined : value;
};

const sanitizeMediaPayload = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return [];

  return mediaArray
    .map((media) => {
      const normalized = {
        _id: media?._id || undefined,
        url: media?.url || undefined,
        publicId: media?.publicId || undefined,
        originalName: media?.originalName || undefined,
        mimetype: media?.mimetype || media?.mimeType || undefined,
        size: toNumberOrUndefined(media?.size),
      };

      return Object.fromEntries(
        Object.entries(normalized).filter(([, value]) => value !== undefined),
      );
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

const prepareProjectPayload = (data = {}) => {
  const payload = {
    ...data,
    coverMedia: sanitizeMediaPayload(data.coverMedia),
    documents: sanitizeMediaPayload(data.documents),
    startDate: toIsoOrUndefined(data.startDate),
    endDate: toIsoOrUndefined(data.endDate),
    milestones: sanitizeMilestones(data.milestones),
    budgetBreakdown: sanitizeBudgetBreakdown(data.budgetBreakdown),
    volunteerRoles: sanitizeVolunteerRoles(data.volunteerRoles),
    deletedDocumentIds:
      Array.isArray(data.deletedDocumentIds) && data.deletedDocumentIds.length
        ? data.deletedDocumentIds
        : undefined,
  };

  if (payload.coverMedia) payload.coverMedia = sanitizeMediaPayload(payload.coverMedia);
  if (payload.documents) payload.documents = sanitizeMediaPayload(payload.documents);

  if (payload.milestones && Array.isArray(payload.milestones)) {
    payload.milestones = payload.milestones.map(m => {
      const cleanedMilestone = { ...m };
      
      if (!cleanedMilestone.location || !cleanedMilestone.location.coordinates || cleanedMilestone.location.coordinates.length === 0) {
        delete cleanedMilestone.location;
      }
      
      delete cleanedMilestone.evidencePolicy;
      
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

const getData = (response) => response.data?.data;

export const projectAPI = {
  createDraft: async (data) => {
    const payload = prepareProjectPayload(data);
    delete payload.deletedDocumentIds;

    const response = await httpClient.post('/project', payload);
    return response.data?.data;
  },

  async updateDraft({ id, data }) {
    const response = await httpClient.put(
      `/project/${id}/draft`,
      prepareProjectPayload(data),
    );
    return getData(response);
  },

  async submitForApproval(id) {
    const response = await httpClient.post(`/project/${id}/submit`);
    return getData(response);
  },

  async getFeatured() {
    const response = await httpClient.get("/project/featured");
    return getData(response);
  },

  async getVolunteerNeeded() {
    const response = await httpClient.get("/project/volunteers-needed");
    return getData(response);
  },

  async getExplore(params) {
    const response = await httpClient.get("/project/explore", { params });
    return getData(response);
  },

  async getDetail(id) {
    const response = await httpClient.get(`/project/${id}`);
    return getData(response);
  },

  async getDraftDetail(id) {
    const response = await httpClient.get(`/project/${id}/draft`);
    return getData(response);
  },

  async getWorkspaceProjects(params = {}) {
    const response = await httpClient.get("/project/organizer/my-projects", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 12,
        status: params.status ?? "ALL",
      },
    });

    return getData(response);
  },

  async getFeedPosts(projectId, { limit = 10, cursor = null } = {}) {
    const params = { limit };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await httpClient.get(`/project/${projectId}/feed/posts`, {
      params,
    });

    return getData(response);
  },

  async createFeedPost(projectId, data) {
    const response = await httpClient.post(
      `/project/${projectId}/feed/posts`,
      data,
    );
    return getData(response);
  },

  async createFeedComment(projectId, postId, data) {
    const response = await httpClient.post(
      `/project/${projectId}/feed/posts/${postId}/comments`,
      data,
    );
    return getData(response);
  },

  async reportProject(projectId, payload) {
    const response = await httpClient.post(
      `/project/${projectId}/report`,
      payload,
    );
    return getData(response);
  },

  async toggleFeedPostLike(projectId, postId) {
    const response = await httpClient.post(
      `/project/${projectId}/feed/posts/${postId}/like`,
    );
    return getData(response);
  },

  async toggleFeedCommentLike(projectId, commentId) {
    const response = await httpClient.post(
      `/project/${projectId}/feed/comments/${commentId}/like`,
    );
    return getData(response);
  },
};