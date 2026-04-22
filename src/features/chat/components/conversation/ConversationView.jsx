import { useCallback, useMemo, useState } from 'react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useConversations } from '@/features/chat/hooks/conversations/useConversations';
import { useConversationRead } from '@/features/chat/hooks/messages/useConversationRead';
import { usePinnedMessages } from '@/features/chat/hooks/messages/usePinnedMessages';
import { useUnpinMessage } from '@/features/chat/hooks/messages/useUnpinMessage';
import { useChatStore, chatSelectors } from '@/features/chat/stores/useChatStore';
import {
  getConversationTitle,
  getConversationSubtitle,
} from '@/features/chat/utils/conversation';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import PinnedMessagesDrawer from '../message/PinnedMessagesDrawer';

export default function ConversationView({
  conversationId,
  compact = false,
  header = null,
  emptyState = null,
  onOpenFullPage = null,
}) {
  const [scrollSignal, setScrollSignal] = useState(0);
  const [jumpToMessageId, setJumpToMessageId] = useState('');

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id || '';

  const { conversations = [] } = useConversations();
  const { handleComposerFocus } = useConversationRead(conversationId);
  const { pinnedMessages = [] } = usePinnedMessages(conversationId);
  const { unpinMessageAsync } = useUnpinMessage(conversationId);

  const pinnedPanelOpen = useChatStore(
    chatSelectors.pinnedPanelOpen(conversationId)
  );
  const openPinnedPanel = useChatStore((state) => state.openPinnedPanel);
  const closePinnedPanel = useChatStore((state) => state.closePinnedPanel);

  const conversation = useMemo(() => {
    return (conversations || []).find(
      (item) => String(item?._id || '') === String(conversationId || '')
    );
  }, [conversations, conversationId]);

  const handleFocusAndRead = useCallback(() => {
    handleComposerFocus?.();
  }, [handleComposerFocus]);

  const handleOpenPinnedPanel = useCallback(() => {
    if (!conversationId) return;
    openPinnedPanel(conversationId);
  }, [conversationId, openPinnedPanel]);

  const handleClosePinnedPanel = useCallback(() => {
    if (!conversationId) return;
    closePinnedPanel(conversationId);
  }, [conversationId, closePinnedPanel]);

  const handleUnpin = useCallback(
    async (messageId) => {
      if (!messageId) return;

      try {
        await unpinMessageAsync({ messageId });
      } catch (error) {
        console.error('[unpinMessage failed]', error);
      }
    },
    [unpinMessageAsync]
  );

  const handleJumpToPinnedMessage = useCallback(
    (messageId) => {
      if (!messageId) return;
      handleClosePinnedPanel();
      setJumpToMessageId(String(messageId));
    },
    [handleClosePinnedPanel]
  );

  const handleJumpHandled = useCallback(() => {
    setJumpToMessageId('');
  }, []);

  if (!conversationId) {
    return emptyState || null;
  }

  const title = getConversationTitle(conversation, myId);
  const subtitle = getConversationSubtitle(conversation);

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {typeof header === 'function'
        ? header({
            conversation,
            title,
            subtitle,
            pinnedMessages,
            pinnedCount: Array.isArray(pinnedMessages)
              ? pinnedMessages.length
              : 0,
            onOpenPinnedMessages: handleOpenPinnedPanel,
            onOpenFullPage,
          })
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
          jumpToMessageId={jumpToMessageId}
          onJumpHandled={handleJumpHandled}
        />
      </div>

      <div
        className="shrink-0 border-t border-slate-100 bg-white"
        onMouseDownCapture={handleFocusAndRead}
        onClickCapture={handleFocusAndRead}
      >
        <MessageComposer
          conversationId={conversationId}
          onSent={() => setScrollSignal((value) => value + 1)}
          onComposerFocus={handleFocusAndRead}
        />
      </div>

      <PinnedMessagesDrawer
        open={pinnedPanelOpen}
        pinnedMessages={pinnedMessages}
        currentUserId={myId}
        onClose={handleClosePinnedPanel}
        onUnpin={handleUnpin}
        onJumpToMessage={handleJumpToPinnedMessage}
      />
    </div>
  );
}