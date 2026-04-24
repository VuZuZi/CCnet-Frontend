import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import {
  connectChatSocket,
  disconnectChatSocket,
  CHAT_EVENTS,
} from "@/features/chat/socket/chatSocket";
import { chatKeys } from "@/features/chat/constants/chat.queryKeys";

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

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) {
      disconnectChatSocket();
      return undefined;
    }

    const socket = connectChatSocket();

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

    socket.on(CHAT_EVENTS.MESSAGE_NEW, refreshConversationMessages);
    socket.on(CHAT_EVENTS.MESSAGE_UPDATED, refreshConversationMessages);
    socket.on(CHAT_EVENTS.MESSAGE_READ, refreshConversations);
    socket.on(CHAT_EVENTS.CONVERSATION_UPDATED, refreshConversations);
    socket.on(CHAT_EVENTS.MESSAGE_PINNED, refreshConversationMessages);
    socket.on(CHAT_EVENTS.MESSAGE_UNPINNED, refreshConversationMessages);

    return () => {
      socket.off(CHAT_EVENTS.MESSAGE_NEW, refreshConversationMessages);
      socket.off(CHAT_EVENTS.MESSAGE_UPDATED, refreshConversationMessages);
      socket.off(CHAT_EVENTS.MESSAGE_READ, refreshConversations);
      socket.off(CHAT_EVENTS.CONVERSATION_UPDATED, refreshConversations);
      socket.off(CHAT_EVENTS.MESSAGE_PINNED, refreshConversationMessages);
      socket.off(CHAT_EVENTS.MESSAGE_UNPINNED, refreshConversationMessages);
    };
  }, [isAuthenticated, isAuthLoading, queryClient]);

  return null;
}