import { useCallback, useEffect, useRef, useState } from 'react';
import { useMarkAsRead } from '@/features/chat/hooks/messages/useMarkAsRead';

const READ_OPTIONS = {
  force: true,
  cooldownMs: 800,
};

export function useConversationRead(conversationId) {
  const { markAsRead, isMarking } = useMarkAsRead();
  const [hasComposerInteracted, setHasComposerInteracted] = useState(false);

  const cid = String(conversationId || '');
  const lastConversationRef = useRef('');
  const hasMarkedInitiallyRef = useRef(false);

  const markConversationRead = useCallback(async () => {
    if (!cid) return;

    try {
      await markAsRead(cid, READ_OPTIONS);
    } finally {
      setHasComposerInteracted(true);
    }
  }, [cid, markAsRead]);

  useEffect(() => {
    const changedConversation = lastConversationRef.current !== cid;

    if (!changedConversation) return;

    lastConversationRef.current = cid;
    hasMarkedInitiallyRef.current = false;
    setHasComposerInteracted(false);
  }, [cid]);

  useEffect(() => {
    if (!cid || hasMarkedInitiallyRef.current) return;

    hasMarkedInitiallyRef.current = true;
    markConversationRead();
  }, [cid, markConversationRead]);

  return {
    hasComposerInteracted,
    handleComposerFocus: markConversationRead,
    isMarking,
  };
}

export default useConversationRead;