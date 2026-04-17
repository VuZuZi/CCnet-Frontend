import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Pin,
  Settings,
  SquareArrowOutUpRight,
  Users,
  X,
} from "lucide-react";
import { getConversationAvatarData } from "../../utils/conversation";

function AvatarFallback({ title = "", compact = false }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 ring-1 ring-slate-200 ${
        compact ? "h-10 w-10 text-sm" : "h-12 w-12 text-base"
      }`}
    >
      {String(title || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function ChatHeader({
  conversation,
  myId,
  title,
  isGroup = false,
  participantCount = 0,
  pinnedCount = 0,
  onOpenManageGroup,
  onOpenPinnedMessages,
  onOpenFullPage,
  onCloseConversation,
  isWidget = false,
  isFullPage = false,
}) {
  const avatarData = getConversationAvatarData(conversation, myId);
  const avatar = avatarData?.src || "";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const canOpenPinned = Number(pinnedCount || 0) > 0;
  const showDropdownMenu = Boolean(isWidget && !isFullPage);
  const showFullPagePinnedButton = Boolean(isFullPage);

  const compact = Boolean(isWidget && !isFullPage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenPinned = () => {
    if (!canOpenPinned) return;
    setMenuOpen(false);
    onOpenPinnedMessages?.();
  };

  const handleOpenFullPage = () => {
    setMenuOpen(false);
    onOpenFullPage?.();
  };

  const handleOpenManageGroup = () => {
    setMenuOpen(false);
    onOpenManageGroup?.();
  };

  return (
    <header
      className={`flex shrink-0 items-center justify-between border-b border-slate-200 bg-white ${
        compact ? "px-4 py-3" : "px-5 py-4"
      }`}
    >
      <div className={`flex min-w-0 items-center ${compact ? "gap-3" : "gap-4"}`}>
        {avatar ? (
          <img
            src={avatar}
            alt={title || "Ảnh cuộc trò chuyện"}
            className={`rounded-full object-cover ring-1 ring-slate-200 ${
              compact ? "h-10 w-10" : "h-12 w-12"
            }`}
          />
        ) : (
          <AvatarFallback title={title} compact={compact} />
        )}

        <div className="min-w-0">
          <div
            className={`truncate font-black leading-none text-slate-900 ${
              compact ? "text-[20px]" : "text-[28px]"
            }`}
          >
            {title || "Cuộc trò chuyện"}
          </div>

          <div
            className={`mt-1 inline-flex items-center gap-1.5 text-slate-500 ${
              compact ? "text-sm" : "text-[15px]"
            }`}
          >
            <Users className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"} />
            {isGroup ? `${participantCount} thành viên` : "Đang hoạt động"}
          </div>
        </div>
      </div>

      <div className={`flex shrink-0 items-center ${compact ? "gap-2" : "gap-3"}`}>
        {showFullPagePinnedButton ? (
          <button
            type="button"
            onClick={handleOpenPinned}
            disabled={!canOpenPinned}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
              canOpenPinned
                ? "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            }`}
            title={
              canOpenPinned
                ? `Mở ${pinnedCount} tin nhắn đã ghim`
                : "Chưa có tin nhắn ghim"
            }
          >
            <Pin className="h-4 w-4" />
            <span>
              {canOpenPinned ? `Tin nhắn đã ghim (${pinnedCount})` : "Chưa có ghim"}
            </span>
          </button>
        ) : null}

        {showDropdownMenu ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 ${
                compact ? "h-10 w-10" : "h-11 w-11"
              }`}
              title="Tùy chọn"
              aria-label="Tùy chọn"
            >
              <ChevronDown
                className={`transition-transform duration-200 ${
                  compact ? "h-5 w-5" : "h-[22px] w-[22px]"
                } ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                <button
                  type="button"
                  onClick={handleOpenPinned}
                  disabled={!canOpenPinned}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    canOpenPinned
                      ? "text-slate-700 hover:bg-amber-50 hover:text-amber-800"
                      : "cursor-not-allowed text-slate-400 opacity-70"
                  }`}
                >
                  <Pin
                    className={`h-4 w-4 ${
                      canOpenPinned ? "text-amber-600" : "text-slate-300"
                    }`}
                  />
                  <div className="flex-1">
                    <div>Xem tin nhắn đã ghim</div>
                    <div className="text-xs text-slate-400">
                      {canOpenPinned
                        ? `${pinnedCount} tin nhắn quan trọng`
                        : "Chưa có tin nhắn ghim"}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleOpenFullPage}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                >
                  <SquareArrowOutUpRight className="h-4 w-4 text-amber-600" />
                  <div className="flex-1">
                    <div>Mở trang chatbox</div>
                    <div className="text-xs text-slate-400">
                      Mở cuộc trò chuyện toàn màn hình
                    </div>
                  </div>
                </button>

                {isGroup ? (
                  <button
                    type="button"
                    onClick={handleOpenManageGroup}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                  >
                    <Settings className="h-4 w-4 text-amber-600" />
                    <div className="flex-1">
                      <div>Quản lý nhóm</div>
                      <div className="text-xs text-slate-400">
                        Thành viên, tên nhóm, ảnh đại diện
                      </div>
                    </div>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {isGroup && !showDropdownMenu ? (
          <button
            type="button"
            onClick={onOpenManageGroup}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Settings className="h-4 w-4" />
            Quản lý nhóm
          </button>
        ) : null}

        {onCloseConversation ? (
          <button
            type="button"
            onClick={onCloseConversation}
            className={`inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 ${
              compact ? "h-10 w-10" : "h-11 w-11"
            }`}
            title="Đóng cuộc trò chuyện"
            aria-label="Đóng cuộc trò chuyện"
          >
            <X className={compact ? "h-5 w-5" : "h-[22px] w-[22px]"} />
          </button>
        ) : null}
      </div>
    </header>
  );
}