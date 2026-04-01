// src/features/chat/components/ChatPanel.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { useConversations } from '../hooks/useConversations';
import { Expand, X } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import ConversationView from '@/features/chat/components/conversation/ConversationView';
import { useConversations } from '@/features/chat/hooks/conversations/useConversations';
import {
  getConversationAvatarData,
  getConversationTitle,
  getConversationSubtitle,
} from '@/features/chat/utils/conversation';

function getDesktopPanelRightOffset(index = 0) {
  return 24 + index * 376;
}

function getPanelLayout(mode, index = 0) {
  if (mode === 'mobile') {
    return {
      className: 'fixed inset-0 z-[1300] h-screen w-screen rounded-none border-0 bg-white shadow-none',
      style: undefined,
      wrapperClassName: 'rounded-none',
    };
  }

  if (mode === 'tablet') {
    return {
      className:
        'fixed bottom-4 right-4 z-[1100] h-[min(760px,calc(100vh-32px))] w-[min(460px,calc(100vw-32px))] rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]',
      style: undefined,
      wrapperClassName: 'rounded-[24px]',
    };
  }

  return {
    className:
      'fixed bottom-6 z-[1001] h-[540px] w-[360px] rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]',
    style: { right: getDesktopPanelRightOffset(index) },
    wrapperClassName: 'rounded-[24px]',
  };
}

function AvatarFallback({ title = '' }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
      {String(title || '?').slice(0, 1).toUpperCase()}
    </div>
  );
}

export function ChatPanel({
  conversationId,
  index = 0,
  mode = 'desktop',
  onClose,
}) {
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const conversation = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    return list.find((item) => String(item?._id || '') === String(conversationId || '')) || null;
  }, [conversations, conversationId]);

  const title = getConversationTitle(conversation, myId);
  const subtitle = getConversationSubtitle(conversation);
  const avatarData = getConversationAvatarData(conversation, myId);
  const avatar = avatarData?.src || '';

  const { className, style, wrapperClassName } = getPanelLayout(mode, index);

  return (
    <div className={className} style={style}>
      <div className={`flex h-full min-h-0 flex-col overflow-hidden bg-white ${wrapperClassName}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={title || 'conversation avatar'}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <AvatarFallback title={title} />
            )}

            <div className="min-w-0">
              <div className="truncate text-sm font-black text-slate-900">
                {title || 'Cuộc trò chuyện'}
              </div>
              <div className="truncate text-xs text-slate-500">
                {subtitle || 'Đang hoạt động'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(`/messages/${conversationId}`)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="Mở trang tin nhắn lớn"
              title="Mở trang tin nhắn lớn"
            >
              <Expand className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="Đóng khung chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ConversationView
            key={String(conversationId || '')}
            conversationId={conversationId}
            compact={mode !== 'mobile'}
            emptyState={
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Chọn một cuộc trò chuyện
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;