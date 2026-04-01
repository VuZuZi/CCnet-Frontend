export const chatKeys = {
  all: ['chat'],
  conversations: () => ['chat', 'conversations'],
  messages: (conversationId) => ['chat', 'messages', String(conversationId || '')],
  assets: (conversationId, type) => ['chat', 'assets', String(conversationId || ''), String(type || '')],
};

export default chatKeys;