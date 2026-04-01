import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { useReactMessage } from './useReactMessage';
import { useUnsendMessage } from './useUnsendMessage';

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
    isUnsendLoading,
    handleReply,
    handleReact,
    handleUnsend,
    openActions,
    scheduleCloseActions,
    handleBlurCapture,
  };
}

export default useMessageBubbleActions;