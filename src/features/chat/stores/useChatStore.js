import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialState = {
  openConversationIds: [],
  focusedConversationId: null,
  replyDraftByConversation: {},
};

export const useChatStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      openConversation: (conversationId) => {
        const id = String(conversationId);
        const prev = get().openConversationIds;

        const exists = prev.some((x) => String(x) === id);
        const next = exists ? [id, ...prev.filter((x) => String(x) !== id)] : [id, ...prev];

        set(
          {
            openConversationIds: next.slice(0, 2),
            focusedConversationId: id,
          },
          false,
          'chat/openConversation'
        );
      },

      closeConversation: (conversationId) => {
        const id = String(conversationId);
        const prev = get().openConversationIds;
        const next = prev.filter((x) => String(x) !== id);

        const focused = get().focusedConversationId;
        const nextFocused = String(focused) === id ? (next[0] ? String(next[0]) : null) : focused;

        const replyMap = { ...(get().replyDraftByConversation || {}) };
        delete replyMap[id];

        set(
          {
            openConversationIds: next,
            focusedConversationId: nextFocused,
            replyDraftByConversation: replyMap,
          },
          false,
          'chat/closeConversation'
        );
      },

      focusConversation: (conversationId) => {
        const id = String(conversationId);
        set({ focusedConversationId: id }, false, 'chat/focusConversation');
      },

      setReplyDraft: (conversationId, message) => {
        const id = String(conversationId || '');
        if (!id) return;

        set(
          {
            replyDraftByConversation: {
              ...(get().replyDraftByConversation || {}),
              [id]: message || null,
            },
          },
          false,
          'chat/setReplyDraft'
        );
      },

      clearReplyDraft: (conversationId) => {
        const id = String(conversationId || '');
        if (!id) return;

        const next = { ...(get().replyDraftByConversation || {}) };
        delete next[id];

        set({ replyDraftByConversation: next }, false, 'chat/clearReplyDraft');
      },

      clearChat: () => {
        set({ ...initialState }, false, 'chat/clearChat');
      },
    }),
    { name: 'ChatStore' }
  )
);

export const chatSelectors = {
  openConversationIds: (s) => s.openConversationIds,
  focusedConversationId: (s) => s.focusedConversationId,
  replyDraftByConversation: (conversationId) => (s) =>
    s.replyDraftByConversation?.[String(conversationId || '')] || null,
};