import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import ContactsSidebar from "@/features/chat/components/conversation/ContactsSidebar";
import { chatKeys } from "@/features/chat/constants/chat.queryKeys";
import { disconnectChatSocket } from "@/features/chat/lib/socketClient";
import { useChatStore, chatSelectors } from "@/features/chat/stores/useChatStore";
import { getNavbarFloatingPanelMetrics } from "@/shared/lib/navbarFloatingPanel";

function getWidgetStyle(mode, anchorRect) {
  if (mode === "mobile") {
    return {
      className:
        "fixed inset-0 z-[6200] h-screen w-screen overflow-hidden rounded-none bg-white shadow-none",
      style: undefined,
    };
  }

  if (mode === "tablet") {
    const metrics = getNavbarFloatingPanelMetrics(anchorRect, { width: 408 });
    return {
      className:
        "fixed z-[6200] overflow-hidden rounded-[24px] border border-[#FBBF24]/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
      style: {
        top: metrics.top,
        right: metrics.right,
        width: metrics.width,
        maxWidth: metrics.maxWidth,
        height: Math.min(680, metrics.availableHeight),
      },
    };
  }

  const metrics = getNavbarFloatingPanelMetrics(anchorRect, { width: 408 });
  return {
    className:
      "fixed z-[6200] overflow-hidden rounded-[24px] border border-[#FBBF24]/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
    style: {
      top: metrics.top,
      right: metrics.right,
      width: metrics.width,
      maxWidth: metrics.maxWidth,
      height: Math.min(640, metrics.availableHeight),
    },
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
