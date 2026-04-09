import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { useReactMessage } from './useReactMessage';
import { useUnsendMessage } from './useUnsendMessage';
import { usePinnedMessages } from './usePinnedMessages';
import { usePinMessage } from './usePinMessage';
import { useUnpinMessage } from './useUnpinMessage';

export function useMessageBubbleActions({
  conversationId,
  message,
}) {
  const [showActions, setShowActions] = useState(false);
  const closeTimerRef = useRef(null);

  const setReplyDraft = useChatStore((state) => state.setReplyDraft);
  const { reactMessageAsync } = useReactMessage(conversationId);
  const { unsendMessageAsync, isLoading: isUnsendLoading } =
    useUnsendMessage(conversationId);

  const { pinnedMessages } = usePinnedMessages(conversationId);
  const { pinMessageAsync, isLoading: isPinLoading } = usePinMessage(conversationId);
  const { unpinMessageAsync, isLoading: isUnpinLoading } = useUnpinMessage(conversationId);

  const isPinned = useMemo(() => {
    const messageId = String(message?._id || '');
    if (!messageId) return false;

    return (Array.isArray(pinnedMessages) ? pinnedMessages : []).some(
      (item) => String(item?.messageId || item?.message?._id || '') === messageId
    );
  }, [message, pinnedMessages]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleReply = useCallback(() => {
    if (!conversationId || !message) return;
    setReplyDraft(conversationId, message);
  }, [conversationId, message, setReplyDraft]);

  const handleReact = useCallback(
    async (emoji) => {
      if (!message?._id || !emoji) return;

      try {
        await reactMessageAsync({
          messageId: message._id,
          emoji,
        });
      } catch (error) {
        console.error('[reactMessage failed]', error);
      }
    },
    [message, reactMessageAsync]
  );

  const handleUnsend = useCallback(async () => {
    if (!message?._id || isUnsendLoading) return;

    try {
      await unsendMessageAsync({
        messageId: message._id,
      });
    } catch (error) {
      console.error('[unsendMessage failed]', error);
    }
  }, [message, isUnsendLoading, unsendMessageAsync]);

  const handlePin = useCallback(async () => {
    if (!message?._id || isPinLoading || isPinned || message?.isUnsent) return;

    try {
      await pinMessageAsync({
        messageId: message._id,
      });
      setShowActions(false);
    } catch (error) {
      console.error('[pinMessage failed]', error);
    }
  }, [message, isPinLoading, isPinned, pinMessageAsync]);

  const handleUnpin = useCallback(async () => {
    if (!message?._id || isUnpinLoading || !isPinned) return;

    try {
      await unpinMessageAsync({
        messageId: message._id,
      });
      setShowActions(false);
    } catch (error) {
      console.error('[unpinMessage failed]', error);
    }
  }, [message, isPinned, isUnpinLoading, unpinMessageAsync]);

  const openActions = useCallback(() => {
    if (message?.isUnsent) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    setShowActions(true);
  }, [message]);

  const scheduleCloseActions = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setShowActions(false);
    }, 180);
  }, []);

  const handleBlurCapture = useCallback(
    (event) => {
      const nextFocused = event.relatedTarget;
      if (!event.currentTarget.contains(nextFocused)) {
        scheduleCloseActions();
      }
    },
    [scheduleCloseActions]
  );

  return {
    showActions,
    isPinned,
    isPinLoading,
    isUnsendLoading,
    handleReply,
    handleReact,
    handleUnsend,
    handlePin,
    handleUnpin,
    openActions,
    scheduleCloseActions,
    handleBlurCapture,
  };
}

export default useMessageBubbleActions;