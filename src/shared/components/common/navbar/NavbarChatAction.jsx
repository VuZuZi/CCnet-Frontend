import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';

import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import ChatPanel from '@/features/chat/components/ChatPanel';
import ChatWidget from '@/features/chat/components/ChatWidget';
import { useConversations } from '@/features/chat/hooks/conversations/useConversations';
import { useChatViewport } from '@/features/chat/hooks/layout/useChatViewport';
import { useChatRealtime } from '@/features/chat/hooks/realtime/useChatRealtime';
import { useChatStore, chatSelectors } from '@/features/chat/stores/useChatStore';

function getUnreadCount(conversation, userId) {
  const unreadCounts = conversation?.unreadCounts;
  if (!unreadCounts || !userId) return 0;

  if (typeof unreadCounts.get === 'function') {
    return Number(unreadCounts.get(String(userId)) || 0);
  }

  return Number(unreadCounts[String(userId)] || 0);
}

function formatBadgeCount(value) {
  if (!value || value <= 0) return '';
  if (value > 99) return '99+';
  return String(value);
}

export function NavbarChatAction({ hideWidget = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);

  const { mode, isMobile, isTablet, isDesktop } = useChatViewport();

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { conversations } = useConversations();

  const openConversationIds = useChatStore(chatSelectors.openConversationIds) || [];
  const focusedConversationId = useChatStore(chatSelectors.focusedConversationId);
  const closeConversation = useChatStore((state) => state.closeConversation);

  useChatRealtime({
    activeConversationId: String(focusedConversationId || ''),
    markActiveConversationAsRead: false,
    enabled: Boolean(user),
  });

  const unreadConversationCount = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];

    return list.reduce((count, conversation) => {
      const unread = getUnreadCount(conversation, myId);
      return unread > 0 ? count + 1 : count;
    }, 0);
  }, [conversations, myId]);

  const orderedOpenConversationIds = useMemo(() => {
    const list = Array.isArray(openConversationIds) ? openConversationIds : [];
    const focusedId = String(focusedConversationId || '');

    if (!focusedId) return list;

    const rest = list.filter((id) => String(id) !== focusedId);
    const focused = list.find((id) => String(id) === focusedId);

    return focused ? [...rest, focused] : list;
  }, [openConversationIds, focusedConversationId]);

  const visibleConversationIds = useMemo(() => {
    if (isMobile || isTablet) {
      return focusedConversationId ? [focusedConversationId] : [];
    }

    return orderedOpenConversationIds;
  }, [focusedConversationId, isMobile, isTablet, orderedOpenConversationIds]);

  const updateAnchorRect = () => {
    if (!anchorRef.current) return;
    setAnchorRect(anchorRef.current.getBoundingClientRect());
  };

  const handleToggle = () => {
    if (hideWidget) return;
    updateAnchorRect();
    setIsOpen((prev) => !prev);
  };

  const handleConversationSelected = () => {
    updateAnchorRect();
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen || hideWidget) return undefined;

    updateAnchorRect();

    const handleViewportChange = () => {
      updateAnchorRect();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, hideWidget]);

  useEffect(() => {
    if (hideWidget && isOpen) {
      setIsOpen(false);
    }
  }, [hideWidget, isOpen]);

  return (
    <>
      <div className="relative" ref={anchorRef}>
        <button
          type="button"
          onClick={handleToggle}
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="Open chat widget"
        >
          <MessageCircle size={24} />
          {unreadConversationCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              {formatBadgeCount(unreadConversationCount)}
            </span>
          ) : null}
        </button>
      </div>

      {!hideWidget && typeof document !== 'undefined'
        ? createPortal(
            <>
              <ChatWidget
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                anchorRect={anchorRect}
                onConversationSelected={handleConversationSelected}
                mode={mode}
              />

              {visibleConversationIds.map((conversationId, index) => (
                <ChatPanel
                  key={String(conversationId)}
                  conversationId={conversationId}
                  index={index}
                  mode={mode}
                  onClose={() => closeConversation(conversationId)}
                />
              ))}
            </>,
            document.body
          )
        : null}
    </>
  );
}

export default NavbarChatAction;