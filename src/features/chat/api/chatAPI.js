import httpClient from '@/shared/lib/httpClient';

const unwrap = (payload) => payload?.data ?? payload;

export const chatAPI = {
  async getConversations() {
    const res = await httpClient.get('/chat/conversations');
    return unwrap(res.data);
  },

  async createConversation(payload) {
    const res = await httpClient.post('/chat/conversations', payload);
    return unwrap(res.data);
  },

  async getMessages(conversationId) {
    if (!conversationId) throw new Error('Invalid conversationId');
    const res = await httpClient.get(`/chat/messages/${conversationId}`);
    return unwrap(res.data);
  },

  async sendMessage({ conversationId, text, attachments }) {
    if (!conversationId) throw new Error('Invalid conversationId');

    const formData = new FormData();
    formData.append('conversationId', conversationId);

    if (text !== undefined && text !== null) {
      formData.append('text', text);
    }

    if (Array.isArray(attachments)) {
      attachments.forEach((file) => formData.append('attachments', file));
    }

    const res = await httpClient.post('/chat/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return unwrap(res.data);
  },

  async markAsRead(conversationId) {
    if (!conversationId) throw new Error('Invalid conversationId');
    const res = await httpClient.patch(`/chat/read/${conversationId}`, { isRead: true });
    return unwrap(res.data);
  },

  async downloadFile(filename) {
    if (!filename) throw new Error('Invalid filename');
    const res = await httpClient.get(`/chat/files/${filename}`, {
      responseType: 'blob',
    });
    return { blob: res.data, headers: res.headers };
  },
};
