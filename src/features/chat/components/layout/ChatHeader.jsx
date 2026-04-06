import { Users, Settings } from "lucide-react";
import { getConversationAvatarData } from "../../utils/conversation";

function AvatarFallback({ title = "" }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-700 ring-1 ring-slate-200">
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
  onOpenManageGroup,
}) {
  const avatarData = getConversationAvatarData(conversation, myId);
  const avatar = avatarData?.src || "";

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={title || "conversation avatar"}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
          />
        ) : (
          <AvatarFallback title={title} />
        )}

        <div className="min-w-0">
          <div className="truncate text-xl font-black text-slate-900">
            {title || "Cuộc trò chuyện"}
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="h-4 w-4" />
            {isGroup ? `${participantCount} thành viên` : "Đang hoạt động"}
          </div>
        </div>
      </div>

      {isGroup ? (
        <button
          type="button"
          onClick={onOpenManageGroup}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Settings className="h-4 w-4" />
          Quản lý nhóm
        </button>
      ) : null}
    </header>
  );
}