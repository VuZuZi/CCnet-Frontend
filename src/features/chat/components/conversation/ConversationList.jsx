import { useCallback, useMemo } from 'react';

import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import ConversationListItem from '@/features/chat/components/conversation/ConversationListItem';
import { useConversations } from '@/features/chat/hooks/conversations/useConversations';
import { useChatStore, chatSelectors } from '@/features/chat/stores/useChatStore';
import {
  getConversationTitle,
  getLastPreview,
} from '@/features/chat/utils/conversation';

function filterConversations(conversations = [], keyword = '', myId = '') {
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();
  const list = Array.isArray(conversations) ? conversations : [];

  if (!normalizedKeyword) return list;

  return list.filter((conversation) => {
    const title = getConversationTitle(conversation, myId);
    const preview = getLastPreview(conversation);

    return (
      String(title).toLowerCase().includes(normalizedKeyword) ||
      String(preview).toLowerCase().includes(normalizedKeyword)
    );
  });
}

export function ConversationList({
  onConversationSelected,
  searchKeyword = '',
}) {
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const openConversation = useChatStore((state) => state.openConversation);
  const focusConversation = useChatStore((state) => state.focusConversation);
  const focusedConversationId = useChatStore(chatSelectors.focusedConversationId);

  const { conversations, isLoading, isError, errorMessage } = useConversations();

  const filteredConversations = useMemo(() => {
    return filterConversations(conversations, searchKeyword, myId);
  }, [conversations, searchKeyword, myId]);

  const handleSelectConversation = useCallback(
    (conversation) => {
      const conversationId = String(conversation?._id || '');
      if (!conversationId) return;

      openConversation(conversationId);
      focusConversation(conversationId);
      onConversationSelected?.(conversationId);
    },
    [focusConversation, onConversationSelected, openConversation]
  );

  if (!user || isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#f6c343] border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3">
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
          {errorMessage || 'Failed to load conversations'}
        </div>
      </div>
    );
  }

  if (!filteredConversations.length) {
    return (
      <div className="p-3">
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
          No matching conversations found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {filteredConversations.map((conversation) => {
        const conversationId = String(conversation?._id || '');
        const isActive = String(focusedConversationId || '') === conversationId;

        return (
          <ConversationListItem
            key={conversationId}
            conversation={conversation}
            myId={myId}
            isActive={isActive}
            onSelect={handleSelectConversation}
          />
        );
      })}
    </div>
  );
}

export default ConversationList;