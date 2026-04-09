import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useMessages } from "../../hooks/messages/useMessages";
import { useConversations } from "../../hooks/conversations/useConversations";
import MessageBubble from "../message/MessageBubble";
import {
  dedupeMessages,
  enrichMessageGroups,
  getSenderId,
  getUserId,
  sortMessagesByCreatedAt,
} from "../../utils/messageList";
import { shouldShowDeliveryStatus } from "../../utils/messageList.delivery";

function TimeSeparator({ label, compact = false }) {
  if (!label) return null;

  return (
    <div className={compact ? "flex justify-center py-2" : "flex justify-center py-3"}>
      <div className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
        {label}
      </div>
    </div>
  );
}

export function MessageList({
  conversationId,
  scrollSignal,
  compact = false,
  jumpToMessageId = "",
  onJumpHandled,
}) {
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { messages, isLoading } = useMessages(conversationId);
  const { conversations } = useConversations();

  const listRef = useRef(null);
  const endRef = useRef(null);
  const firstRenderRef = useRef(true);
  const lastConversationRef = useRef("");
  const lastMessageIdRef = useRef("");

  const activeConversation = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    return list.find((c) => String(c?._id) === String(conversationId)) || null;
  }, [conversations, conversationId]);

  const participantMap = useMemo(() => {
    const map = new Map();
    const participants = Array.isArray(activeConversation?.participants)
      ? activeConversation.participants
      : [];

    participants.forEach((participant) => {
      const id = getUserId(participant);
      if (!id) return;
      map.set(String(id), participant);
    });

    return map;
  }, [activeConversation]);

  const safeMessages = useMemo(() => {
    const arr = Array.isArray(messages) ? messages : [];
    return sortMessagesByCreatedAt(dedupeMessages(arr));
  }, [messages]);

  const groupedMessages = useMemo(() => {
    return enrichMessageGroups(safeMessages, myId, participantMap);
  }, [safeMessages, myId, participantMap]);

  const renderedMessages = useMemo(() => {
    return groupedMessages.map((message, index) => ({
      message,
      showDeliveryStatus: shouldShowDeliveryStatus(groupedMessages, index, myId),
    }));
  }, [groupedMessages, myId]);

  const scrollToBottom = (behavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const highlightMessageNode = (target) => {
    if (!target) return;

    target.classList.remove("reply-jump-highlight");
    void target.offsetWidth;
    target.classList.add("reply-jump-highlight");

    window.clearTimeout(target.__replyJumpTimer);
    target.__replyJumpTimer = window.setTimeout(() => {
      target.classList.remove("reply-jump-highlight");
    }, 1400);
  };

  const jumpToMessage = (messageId) => {
    const container = listRef.current;
    if (!container || !messageId) return false;

    const target = container.querySelector(
      `[data-message-id="${String(messageId)}"]`
    );
    if (!target) return false;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    highlightMessageNode(target);
    return true;
  };

  useLayoutEffect(() => {
    const changedConversation =
      String(lastConversationRef.current) !== String(conversationId || "");

    if (changedConversation) {
      lastConversationRef.current = String(conversationId || "");
      firstRenderRef.current = true;
      lastMessageIdRef.current = "";
      scrollToBottom("auto");
    }
  }, [conversationId]);

  useEffect(() => {
    if (!groupedMessages.length) return;

    const latestMessageId = String(
      groupedMessages[groupedMessages.length - 1]?._id || ""
    );

    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      lastMessageIdRef.current = latestMessageId;
      scrollToBottom("auto");
      return;
    }

    if (latestMessageId && latestMessageId !== lastMessageIdRef.current) {
      lastMessageIdRef.current = latestMessageId;
      scrollToBottom("smooth");
    }
  }, [groupedMessages]);

  useEffect(() => {
    if (!scrollSignal) return;
    scrollToBottom("smooth");
  }, [scrollSignal]);

  useEffect(() => {
    if (!jumpToMessageId) return;

    const found = jumpToMessage(jumpToMessageId);
    if (found) {
      onJumpHandled?.();
      return;
    }

    const timer = window.setTimeout(() => {
      jumpToMessage(jumpToMessageId);
      onJumpHandled?.();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [jumpToMessageId, onJumpHandled]);

  if (!conversationId) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f6f7fb]">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="text-sm font-black text-gray-900">Chọn một liên hệ</div>
          <div className="text-xs text-gray-500">
            Bấm vào người bên trái để mở đoạn chat.
          </div>
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
    <>
      <style>
        {`
          .reply-jump-highlight {
            animation: replyJumpHighlight 1.15s ease;
          }

          @keyframes replyJumpHighlight {
            0% {
              transform: translateY(0) scale(1);
              filter: brightness(1);
            }
            20% {
              transform: translateY(-4px) scale(1.01);
              filter: brightness(1.02);
            }
            35% {
              transform: translateY(0) scale(1);
              box-shadow: 0 0 0 3px rgba(252, 211, 77, 0.55);
              border-radius: 26px;
            }
            60% {
              box-shadow: 0 0 0 7px rgba(252, 211, 77, 0.18);
              border-radius: 26px;
            }
            100% {
              transform: translateY(0) scale(1);
              filter: brightness(1);
              box-shadow: 0 0 0 0 rgba(252, 211, 77, 0);
              border-radius: 26px;
            }
          }
        `}
      </style>

      <div
        ref={listRef}
        onWheelCapture={(event) => {
          event.stopPropagation();
        }}
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#f6f7fb] [scrollbar-color:rgba(17,24,39,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-900/20 [&::-webkit-scrollbar]:w-1.5 ${
          compact ? "px-3 py-3 pb-4" : "px-5 py-4 pb-6"
        }`}
      >
        <div className={compact ? "space-y-0.5" : "space-y-1"}>
          {renderedMessages.map(({ message, showDeliveryStatus }, index) => {
            const senderId = getSenderId(message?.senderId);
            const reactKey = message?._id
              ? String(message._id)
              : `fallback_${senderId}_${String(message?.createdAt || "")}_${index}`;

            return (
              <div key={reactKey} className="overflow-visible">
                {message?.__ui?.showTimeSeparator ? (
                  <TimeSeparator
                    label={message?.__ui?.timeSeparatorLabel}
                    compact={compact}
                  />
                ) : null}

                <MessageBubble
                  message={message}
                  conversationId={conversationId}
                  currentUserId={myId}
                  compact={compact}
                  showSenderName={Boolean(message?.__ui?.showSenderName)}
                  showSenderAvatar={Boolean(message?.__ui?.showSenderAvatar)}
                  showSeenAvatars={Boolean(message?.__ui?.showSeenAvatars)}
                  showDeliveryStatus={showDeliveryStatus}
                  deliveryStatus={message?.__ui?.deliveryStatus || null}
                  seenUsers={message?.__ui?.seenUsers || []}
                  onJumpToMessage={jumpToMessage}
                />
              </div>
            );
          })}

          <div ref={endRef} />
        </div>
      </div>
    </>
  );
}

export default MessageList;