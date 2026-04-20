import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import ContactsSidebar from "@/features/chat/components/conversation/ContactsSidebar";
import { chatKeys } from "@/features/chat/constants/chat.queryKeys";
import { disconnectChatSocket } from "@/features/chat/lib/socketClient";
import { useChatStore, chatSelectors } from "@/features/chat/stores/useChatStore";

function getWidgetStyle(mode) {
  if (mode === "mobile") {
    return {
      className:
        "fixed inset-0 z-[6200] h-screen w-screen overflow-hidden rounded-none bg-white shadow-none",
      style: undefined,
    };
  }

  if (mode === "tablet") {
    return {
      className:
        "fixed bottom-4 right-4 z-[6200] h-[min(760px,calc(100vh-32px))] w-[min(460px,calc(100vw-32px))] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]",
      style: undefined,
    };
  }

  return {
    className:
      "fixed right-4 top-[92px] z-[6200] h-[min(640px,calc(100vh-112px))] w-[min(460px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]",
    style: undefined,
  };
}

export default function ChatWidget({
  isOpen,
  onClose,
  anchorRect,
  onConversationSelected,
  mode = "desktop",
}) {
  const queryClient = useQueryClient();
  const widgetRef = useRef(null);

  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);

  const openConversationIds = useChatStore(chatSelectors.openConversationIds) || [];
  const clearChat = useChatStore((state) => state.clearChat);

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    }

    if (!isAuthLoading && !isAuthenticated) {
      clearChat();
      queryClient.removeQueries({ queryKey: chatKeys.all });
      disconnectChatSocket();
    }
  }, [isAuthenticated, isAuthLoading, clearChat, queryClient]);

  if (!isOpen) return null;

  const { className, style } = getWidgetStyle(mode, anchorRect);

  return (
    <div
      ref={widgetRef}
      className={className}
      style={style}
      data-open-conversations={openConversationIds.length}
      data-chat-widget-root="true"
    >
      <ContactsSidebar
        onConversationSelected={onConversationSelected}
        onOpenFullPage={onClose}
      />
    </div>
  );
}