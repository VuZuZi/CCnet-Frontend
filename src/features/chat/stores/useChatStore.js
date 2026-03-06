import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialState = {
  openConversationIds: [],
  focusedConversationId: null,
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

        set(
          {
            openConversationIds: next,
            focusedConversationId: nextFocused,
          },
          false,
          'chat/closeConversation'
        );
      },

      focusConversation: (conversationId) => {
        const id = String(conversationId);
        set({ focusedConversationId: id }, false, 'chat/focusConversation');
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
};
