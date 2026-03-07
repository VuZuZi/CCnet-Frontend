import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useMessages } from '../hooks/useMessages';
import { MessageBubble } from './MessageBubble';

export function MessageList({ conversationId, scrollSignal }) {
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { messages, isLoading } = useMessages(conversationId);

  const listRef = useRef(null);
  const endRef = useRef(null);

  const safeMessages = useMemo(() => messages || [], [messages]);

  const scrollToBottom = (behavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (!conversationId || isLoading) return;

    scrollToBottom('auto');
  }, [conversationId, isLoading]);

  useEffect(() => {
    if (!conversationId || safeMessages.length === 0) return;

    const el = listRef.current;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom || scrollSignal) {
      scrollToBottom('smooth');
    }
  }, [safeMessages.length, scrollSignal, conversationId]);

  if (!conversationId) {
    return (
      <div className="flex min-h-0 flex-1 grid-cols-1 place-items-center bg-[#f6f7fb] p-5 text-center">
        <div>
          <div className="mb-1.5 font-black text-gray-900">Chọn một liên hệ</div>
          <div className="text-xs text-gray-500">Bấm vào người bên phải để mở hộp chat.</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f6f7fb]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#f6c343] border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[#f6f7fb] p-3 [scrollbar-color:rgba(17,24,39,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-900/20 [&::-webkit-scrollbar]:w-1.5"
    >
      {safeMessages.map((m) => {
        const senderId = m?.senderId?._id || m?.senderId?.userId || m?.senderId;
        const isMine = String(senderId) === String(myId);
        return <MessageBubble key={m._id} message={m} isMine={isMine} />;
      })}
      <div ref={endRef} />
    </div>
  );
}