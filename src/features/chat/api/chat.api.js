import httpClient from '@/shared/lib/httpClient';
import { env } from '@/config/env';

const DEFAULT_SERVER_URL = 'http://localhost:5000';

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function assertRequired(value, fieldName) {
  if (!value) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

function pickFilename(attachment) {
  return (
    attachment?.filename ||
    attachment?.fileName ||
    attachment?.name ||
    attachment?.originalName ||
    null
  );
}

function normalizeBaseUrl() {
  return (env?.SERVER_URL || DEFAULT_SERVER_URL).replace(/\/+$/, '');
}

function normalizeRelativeUrl(baseUrl, value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return `http:${raw}`;
  if (raw.startsWith('/')) return `${baseUrl}${raw}`;

  return `${baseUrl}/${raw.replace(/^\.?\//, '')}`;
}

function appendIfDefined(formData, key, value) {
  if (value !== undefined && value !== null && value !== '') {
    formData.append(key, value);
  }
}

function appendArray(formData, key, values = []) {
  if (!Array.isArray(values)) return;

  values.forEach((value) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
}

function buildGroupConversationFormData(payload = {}) {
  const formData = new FormData();

  formData.append('type', 'group');
  formData.append('groupName', payload?.groupName || '');

  appendArray(formData, 'participantIds', payload?.participantIds || []);
  appendIfDefined(formData, 'projectId', payload?.projectId);

  if (payload?.groupAvatarFile instanceof File) {
    formData.append('groupAvatar', payload.groupAvatarFile);
  }

  return formData;
}

function buildUpdateConversationFormData(payload = {}) {
  const formData = new FormData();

  appendIfDefined(formData, 'groupName', payload?.groupName);

  if (payload?.groupAvatarFile instanceof File) {
    formData.append('groupAvatar', payload.groupAvatarFile);
  }

  return formData;
}

function buildSendMessageFormData({
  conversationId,
  text,
  files = [],
  replyTo,
}) {
  assertRequired(conversationId, 'conversationId');

  const formData = new FormData();
  formData.append('conversationId', String(conversationId));

  appendIfDefined(formData, 'text', text);
  appendIfDefined(formData, 'replyTo', replyTo);

  (Array.isArray(files) ? files : []).forEach((file) => {
    if (file instanceof File) {
      formData.append('files', file);
    }
  });

  return formData;
}

async function get(url, config) {
  const response = await httpClient.get(url, config);
  return unwrapResponse(response);
}

async function post(url, data, config) {
  const response = await httpClient.post(url, data, config);
  return unwrapResponse(response);
}

async function patch(url, data, config) {
  const response = await httpClient.patch(url, data, config);
  return unwrapResponse(response);
}

async function remove(url, config) {
  const response = await httpClient.delete(url, config);
  return unwrapResponse(response);
}

export const chatAPI = {
  async getConversations() {
    return get('/chat/conversations');
  },

  async createConversation(payload = {}) {
    if (payload?.type === 'group') {
      return post('/chat/conversations', buildGroupConversationFormData(payload), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return post('/chat/conversations', {
      type: 'direct',
      participantId: payload?.participantId,
      projectId: payload?.projectId || undefined,
    });
  },

  async updateConversation(id, payload = {}) {
    assertRequired(id, 'conversation id');

    return patch(`/chat/conversations/${id}`, buildUpdateConversationFormData(payload), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async addMembers(id, participantIds = []) {
    assertRequired(id, 'conversation id');
    return post(`/chat/conversations/${id}/members`, { participantIds });
  },

  async removeMember(id, participantId) {
    assertRequired(id, 'conversation id');
    assertRequired(participantId, 'participant id');
    return remove(`/chat/conversations/${id}/members/${participantId}`);
  },

  async leaveConversation(id) {
    assertRequired(id, 'conversation id');
    return post(`/chat/conversations/${id}/leave`);
  },

  async getMessages(id) {
    assertRequired(id, 'conversation id');
    return get(`/chat/messages/${id}`);
  },

  async sendMessage(payload = {}) {
    const formData = buildSendMessageFormData(payload);

    return post('/chat/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async reactMessage(messageId, emoji) {
    assertRequired(messageId, 'message id');
    assertRequired(emoji, 'emoji');
    return patch(`/chat/messages/${messageId}/react`, { emoji });
  },

  async unsendMessage(messageId) {
    assertRequired(messageId, 'message id');
    return patch(`/chat/messages/${messageId}/unsend`);
  },

  async markAsRead(conversationId) {
    assertRequired(conversationId, 'conversation id');
    return patch(`/chat/read/${conversationId}`);
  },

  async getConversationAssets(conversationId, type, params = {}) {
    assertRequired(conversationId, 'conversation id');
    assertRequired(type, 'asset type');

    return get(`/chat/conversations/${conversationId}/assets`, {
      params: {
        type,
        page: params?.page || 1,
        limit: params?.limit || 30,
      },
    });
  },

  getAttachmentUrl(attachment) {
    const baseUrl = normalizeBaseUrl();

    const raw =
      attachment?.previewUrl ||
      attachment?.url ||
      (pickFilename(attachment) ? `/chat/files/${pickFilename(attachment)}` : '');

    return normalizeRelativeUrl(baseUrl, raw);
  },
};

export default chatAPI;