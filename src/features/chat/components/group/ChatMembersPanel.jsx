import { ChevronDown, FolderOpen, Images, Link2, Users } from 'lucide-react';

function MemberAvatar({ member }) {
  const avatar = member?.avatar || '';
  const name =
    member?.fullName ||
    member?.username ||
    member?.email ||
    member?.name ||
    'Thành viên';

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
      {String(name).slice(0, 1).toUpperCase()}
    </div>
  );
}

function MemberItem({ member }) {
  const name =
    member?.fullName ||
    member?.username ||
    member?.email ||
    member?.name ||
    'Thành viên';

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50">
      <MemberAvatar member={member} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-800">{name}</div>
        <div className="truncate text-xs text-slate-500">
          {member?.email || member?.username || 'Thành viên'}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-slate-800">{title}</div>
        {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
      </div>
    </button>
  );
}

export default function ChatMembersPanel({
  conversation,
  title,
  isGroup = false,
  participantCount = 0,
  shouldShowMembersToggle = false,
  showMembers = false,
  onToggleMembers,
  onOpenAssets,
}) {
  const members = Array.isArray(conversation?.participants)
    ? conversation.participants
    : [];

  return (
    <aside className="hidden h-full w-[320px] shrink-0 border-l border-slate-200 bg-white xl:flex xl:flex-col">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="text-lg font-black text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-500">
          {isGroup ? `${participantCount} thành viên` : 'Thông tin cuộc trò chuyện'}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <ActionCard
          icon={<Images className="h-5 w-5" />}
          title="File phương tiện"
          subtitle="Xem hình ảnh và file"
          onClick={() => onOpenAssets?.('image')}
        />

        <ActionCard
          icon={<FolderOpen className="h-5 w-5" />}
          title="File"
          subtitle="Xem tệp đính kèm"
          onClick={() => onOpenAssets?.('file')}
        />

        <ActionCard
          icon={<Link2 className="h-5 w-5" />}
          title="Liên kết"
          subtitle="Xem liên kết đã chia sẻ"
          onClick={() => onOpenAssets?.('link')}
        />

        {isGroup ? (
          <div className="rounded-3xl border border-slate-200">
            <button
              type="button"
              onClick={onToggleMembers}
              className="flex w-full items-center justify-between px-4 py-4"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="font-bold text-slate-900">Thành viên</span>
              </div>

              {shouldShowMembersToggle ? (
                <ChevronDown className={`h-4 w-4 text-slate-500 transition ${showMembers ? 'rotate-180' : ''}`} />
              ) : null}
            </button>

            {showMembers ? (
              <div className="border-t border-slate-200 p-3">
                <div className="space-y-1">
                  {members.map((member) => {
                    const key = String(member?._id || member?.id || member?.email || Math.random());
                    return <MemberItem key={key} member={member} />;
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}