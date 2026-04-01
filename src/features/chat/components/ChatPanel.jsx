import { useState } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { useConversations } from '../hooks/useConversations';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { X } from 'lucide-react';

export function ChatPanel({ onClose, conversationId, index = 0, className = '', ...props }) {
  useChatSocket(conversationId);

  const focusConversation = useChatStore((s) => s.focusConversation);
  const titleOverrides = useChatStore((s) => s.conversationTitleOverrides);
  const titleOverride = titleOverrides?.[String(conversationId)] || null;
  const [scrollSignal, setScrollSignal] = useState(0);

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { conversations } = useConversations();

  const active = (conversations || []).find((c) => String(c?._id) === String(conversationId));
  const participants = active?.participants || [];
  const other = participants.find((p) => String(p?._id) !== String(myId)) || participants[0] || null;

  const headerTitle = titleOverride || other?.fullName || other?.email || 'Chat';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const rightPosition = isMobile ? 10 : 120 + index * 350;
  
  const zIndex = 1000 + index;

  return (
    <article
      {...props}
      style={{ right: `${rightPosition}px`, zIndex }}
      className={`fixed bottom-[18px] flex h-[460px] max-h-[calc(100vh-110px)] w-[330px] max-lg:w-[calc(100vw-20px)] max-lg:max-h-none max-lg:h-[70vh] max-lg:bottom-2.5 flex-col overflow-hidden rounded-xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-out animate-in slide-in-from-bottom-4 ${className}`}
      onMouseDown={() => focusConversation(conversationId)}
    >
      <header className="flex h-[54px] shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-t from-amber-200 to-amber-400 px-3 shadow-[0_2px_0_rgba(17,24,39,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-900/15 bg-white font-black text-gray-900">
            {(headerTitle || '?').trim().slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h3 className="max-w-[180px] truncate text-sm font-black text-gray-900">
              {headerTitle}
            </h3>
            <p className="text-xs text-gray-700">Đang hoạt động</p>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onClose} 
          aria-label="Close Chat"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-white/65 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex min-h-0 flex-1 flex-col bg-gray-50">
        <MessageList conversationId={conversationId} scrollSignal={scrollSignal} />
        <MessageComposer
          conversationId={conversationId}
          onSent={() => setScrollSignal((x) => x + 1)}
        />
      </section>
    </article>
  );
}
