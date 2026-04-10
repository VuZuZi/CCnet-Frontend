export const chatKeys = {
  all: ['chat'],

  conversations: () => ['chat', 'conversations'],

  messages: (conversationId) => [
    'chat',
    'messages',
    String(conversationId || ''),
  ],

  assets: (conversationId, type) => [
    'chat',
    'assets',
    String(conversationId || ''),
    String(type || ''),
  ],

  pinnedMessages: (conversationId) => [
    'chat',
    'pinned-messages',
    String(conversationId || ''),
  ],
};

export default chatKeys;