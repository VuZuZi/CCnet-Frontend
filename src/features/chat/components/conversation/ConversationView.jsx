import { useCallback, useMemo, useState } from 'react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useConversations } from '@/features/chat/hooks/conversations/useConversations';
import { useConversationRead } from '@/features/chat/hooks/messages/useConversationRead';
import { getConversationTitle, getConversationSubtitle } from '@/features/chat/utils/conversation';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';

export default function ConversationView({
  conversationId,
  compact = false,
  header = null,
  emptyState = null,
}) {
  const [scrollSignal, setScrollSignal] = useState(0);

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { conversations } = useConversations();
  const { handleComposerFocus } = useConversationRead(conversationId);

  const conversation = useMemo(() => {
    return (conversations || []).find(
      (item) => String(item?._id || '') === String(conversationId || '')
    );
  }, [conversations, conversationId]);

  const handleFocusAndRead = useCallback(() => {
    handleComposerFocus?.();
  }, [handleComposerFocus]);

  if (!conversationId) {
    return emptyState || null;
  }

  const title = getConversationTitle(conversation, myId);
  const subtitle = getConversationSubtitle(conversation);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {typeof header === 'function'
        ? header({ conversation, title, subtitle })
        : header}

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onMouseDownCapture={handleFocusAndRead}
        onClickCapture={handleFocusAndRead}
      >
        <MessageList
          conversationId={conversationId}
          scrollSignal={scrollSignal}
          compact={compact}
        />
      </div>

      <div
        className="shrink-0 bg-white"
        onMouseDownCapture={handleFocusAndRead}
        onClickCapture={handleFocusAndRead}
      >
        <MessageComposer
          conversationId={conversationId}
          onSent={() => setScrollSignal((v) => v + 1)}
          onComposerFocus={handleFocusAndRead}
        />
      </div>
    </div>
  );
}