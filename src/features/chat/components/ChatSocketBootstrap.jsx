import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import {
  connectChatSocket,
  disconnectChatSocket,
  CHAT_EVENTS,
} from "@/features/chat/socket/chatSocket";
import { disconnectChatSocket as disconnectChatPageSocket } from "@/features/chat/lib/socketClient";
import { chatKeys } from "@/features/chat/constants/chat.queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { authEvents } from "@/shared/lib/httpClient";

function getConversationId(payload) {
  return (
    payload?.conversationId ||
    payload?.conversation?._id ||
    payload?.conversation?.id ||
    payload?.message?.conversationId ||
    payload?.message?.conversation?._id ||
    payload?.message?.conversation?.id ||
    null
  );
}

export default function ChatSocketBootstrap() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);
  const userId = useAuthStore(authSelectors.userId);

  useEffect(() => {
    const disconnectAllChatSockets = () => {
      disconnectChatSocket();
      disconnectChatPageSocket();
    };

    if (!isAuthenticated || isAuthLoading || !userId) {
      disconnectAllChatSockets();
      return undefined;
    }

    const socket = connectChatSocket();

    const joinUserRoom = () => {
      socket.emit(CHAT_EVENTS.USER_JOIN, String(userId));
    };

    const refreshConversations = () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
        exact: true,
      });
    };

    const refreshConversationMessages = (payload) => {
      const conversationId = getConversationId(payload);

      refreshConversations();

      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(conversationId),
          exact: true,
        });

        queryClient.invalidateQueries({
          queryKey: chatKeys.pinnedMessages(conversationId),
          exact: true,
        });
      }
    };

    const handleUserBanned = () => {
      queryClient.clear();
      authEvents.dispatchEvent(
        new CustomEvent("logout", { detail: { reason: "banned" } })
      );
      disconnectAllChatSockets();
      window.location.replace(ROUTES.LOGIN);
    };

    joinUserRoom();
    socket.on("connect", joinUserRoom);
    socket.on(CHAT_EVENTS.MESSAGE_NEW, refreshConversationMessages);
    socket.on(CHAT_EVENTS.MESSAGE_UPDATED, refreshConversationMessages);
    socket.on(CHAT_EVENTS.MESSAGE_READ, refreshConversations);
    socket.on(CHAT_EVENTS.CONVERSATION_UPDATED, refreshConversations);
    socket.on(CHAT_EVENTS.MESSAGE_PINNED, refreshConversationMessages);
    socket.on(CHAT_EVENTS.MESSAGE_UNPINNED, refreshConversationMessages);
    socket.on(CHAT_EVENTS.USER_BANNED, handleUserBanned);

    return () => {
      socket.off("connect", joinUserRoom);
      socket.off(CHAT_EVENTS.MESSAGE_NEW, refreshConversationMessages);
      socket.off(CHAT_EVENTS.MESSAGE_UPDATED, refreshConversationMessages);
      socket.off(CHAT_EVENTS.MESSAGE_READ, refreshConversations);
      socket.off(CHAT_EVENTS.CONVERSATION_UPDATED, refreshConversations);
      socket.off(CHAT_EVENTS.MESSAGE_PINNED, refreshConversationMessages);
      socket.off(CHAT_EVENTS.MESSAGE_UNPINNED, refreshConversationMessages);
      socket.off(CHAT_EVENTS.USER_BANNED, handleUserBanned);
    };
  }, [isAuthenticated, isAuthLoading, queryClient, userId]);

  return null;
}
