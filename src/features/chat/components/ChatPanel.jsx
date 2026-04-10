import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import ConversationView from "@/features/chat/components/conversation/ConversationView";
import ChatHeader from "@/features/chat/components/layout/ChatHeader";
import { useConversations } from "@/features/chat/hooks/conversations/useConversations";

function getDesktopPanelRightOffset(index = 0) {
  return 24 + index * 392;
}

function getPanelLayout(mode, index = 0) {
  if (mode === "mobile") {
    return {
      className:
        "fixed inset-0 z-[1300] h-screen w-screen rounded-none border-0 bg-white shadow-none",
      style: undefined,
      wrapperClassName: "rounded-none",
    };
  }

  if (mode === "tablet") {
    return {
      className:
        "fixed bottom-4 right-4 z-[1100] h-[min(760px,calc(100vh-32px))] w-[min(480px,calc(100vw-32px))] rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]",
      style: undefined,
      wrapperClassName: "rounded-[24px]",
    };
  }

  return {
    className:
      "fixed bottom-6 z-[1001] h-[560px] w-[376px] rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]",
    style: { right: getDesktopPanelRightOffset(index) },
    wrapperClassName: "rounded-[24px]",
  };
}

export function ChatPanel({ conversationId, index = 0, mode = "desktop", onClose }) {
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const conversation = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    return (
      list.find((item) => String(item?._id || "") === String(conversationId || "")) ||
      null
    );
  }, [conversations, conversationId]);

  const { className, style, wrapperClassName } = getPanelLayout(mode, index);

  return (
    <div className={className} style={style}>
      <div
        className={`flex h-full min-h-0 flex-col overflow-hidden bg-white ${wrapperClassName}`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ConversationView
            key={String(conversationId || "")}
            conversationId={conversationId}
            compact={mode !== "mobile"}
            onOpenFullPage={() => navigate(`/messages/${conversationId}`)}
            header={({
              conversation: headerConversation,
              title,
              pinnedCount,
              onOpenPinnedMessages,
              onOpenFullPage,
            }) => (
              <ChatHeader
                conversation={headerConversation}
                myId={myId}
                title={title}
                isGroup={headerConversation?.type === "group"}
                participantCount={headerConversation?.participants?.length || 0}
                pinnedCount={pinnedCount}
                onOpenPinnedMessages={onOpenPinnedMessages}
                onOpenFullPage={onOpenFullPage}
                onCloseConversation={onClose}
                isWidget={true}
                isFullPage={false}
              />
            )}
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