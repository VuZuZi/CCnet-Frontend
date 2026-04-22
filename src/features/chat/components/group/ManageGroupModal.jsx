import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, Search, UserMinus, Users, X } from 'lucide-react';
import GroupInfoForm from './GroupInfoForm';
import UserAvatar from './UserAvatar';
import { chatAPI } from '../../api/chat.api';
import {
  buildUniqueUsers,
  filterUsers,
  getUserId,
} from '../../utils/group';

export function ManageGroupModal({
  open,
  onClose,
  conversation,
  myId,
  conversations = [],
  onUpdateMeta,
  onAddMembers,
  onRemoveMember,
  onLeaveGroup,
  isSavingMeta = false,
  isAddingMembers = false,
  removingMemberId = '',
  isLeavingGroup = false,
}) {
  const [groupName, setGroupName] = useState('');
  const [groupAvatarFile, setGroupAvatarFile] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!open) return;

    setGroupName(conversation?.groupName || '');
    setGroupAvatarFile(null);
    setGroupAvatarPreview(
      chatAPI.getAttachmentUrl({
        url: conversation?.groupAvatar,
        filename: conversation?.groupAvatar,
      }) || ''
    );
    setKeyword('');
    setSelectedIds([]);
  }, [open, conversation]);

  useEffect(() => {
    return () => {
      if (groupAvatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(groupAvatarPreview);
      }
    };
  }, [groupAvatarPreview]);

  useEffect(() => {
    if (!open) return;

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.touchAction = originalBodyTouchAction;
    };
  }, [open]);

  const myIdStr = String(myId || '');

  const adminIds = useMemo(() => {
    return Array.isArray(conversation?.groupAdmins)
      ? conversation.groupAdmins.map((admin) => String(getUserId(admin)))
      : [];
  }, [conversation]);

  const isGroupAdmin = useMemo(() => {
    return adminIds.includes(myIdStr);
  }, [adminIds, myIdStr]);

  const currentParticipants = useMemo(() => {
    return Array.isArray(conversation?.participants)
      ? conversation.participants
      : [];
  }, [conversation]);

  const candidates = useMemo(() => {
    return buildUniqueUsers(conversations, myId, currentParticipants);
  }, [conversations, myId, currentParticipants]);

  const filteredCandidates = useMemo(() => {
    return filterUsers(candidates, keyword);
  }, [candidates, keyword]);

  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (groupAvatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(groupAvatarPreview);
    }

    const preview = URL.createObjectURL(file);
    setGroupAvatarFile(file);
    setGroupAvatarPreview(preview);
    e.target.value = '';
  };

  const originalGroupName = useMemo(() => {
    return String(conversation?.groupName || '').trim();
  }, [conversation]);

  const normalizedGroupName = useMemo(() => {
    return String(groupName || '').trim();
  }, [groupName]);

  const hasNameChanged = normalizedGroupName !== originalGroupName;
  const hasAvatarChanged = Boolean(groupAvatarFile);

  const handleSaveMeta = async () => {
    if (!hasNameChanged && !hasAvatarChanged) return;
    if (!normalizedGroupName && !hasAvatarChanged) return;

    await onUpdateMeta?.({
      groupName: normalizedGroupName,
      groupAvatarFile,
    });
  };

  const handleAddNewMembers = async () => {
    if (!selectedIds.length || isAddingMembers) return;

    await onAddMembers?.(selectedIds);
    setSelectedIds([]);
    setKeyword('');
  };

  const canSaveMeta =
    Boolean(normalizedGroupName) &&
    (hasNameChanged || hasAvatarChanged);

  if (!open || !conversation) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/38 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center p-4 sm:p-5 md:py-8">
        <div
          className="w-full max-w-5xl rounded-[32px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Users className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[19px] font-black text-slate-900">
                  Quản lý nhóm chat
                </div>
                <div className="truncate text-base text-slate-500">
                  {isGroupAdmin
                    ? 'Đổi tên, đổi ảnh, thêm xóa thành viên hoặc rời nhóm'
                    : 'Xem thành viên hiện tại hoặc rời nhóm'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col gap-5 bg-white px-5 py-5 sm:px-7">
            {isGroupAdmin ? (
              <div className="rounded-[30px] border border-slate-200 p-5">
                <GroupInfoForm
                  groupName={groupName}
                  onGroupNameChange={setGroupName}
                  groupAvatarPreview={groupAvatarPreview}
                  onAvatarChange={handleAvatarChange}
                  onSave={handleSaveMeta}
                  isSaving={isSavingMeta}
                  canSave={canSaveMeta}
                  avatarButtonLabel="Đổi ảnh nhóm"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-5">
                <div className="rounded-[30px] border border-slate-200 p-5">
                  <div className="mb-4 text-base font-black text-slate-900">
                    Thành viên hiện tại
                  </div>

                  <div className="space-y-3">
                    {currentParticipants.map((member) => {
                      const memberId = String(getUserId(member));
                      const isMe = memberId === myIdStr;
                      const canRemove = isGroupAdmin && !isMe;

                      return (
                        <div
                          key={memberId}
                          className="flex items-center gap-3 rounded-[24px] border border-slate-200 px-4 py-4"
                        >
                          <UserAvatar user={member} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[15px] font-semibold text-slate-900">
                              {member?.fullName || member?.email}
                            </div>
                            <div className="truncate text-sm text-slate-500">
                              {member?.email || ''}
                            </div>
                          </div>

                          {canRemove ? (
                            <button
                              type="button"
                              onClick={() => onRemoveMember?.(memberId)}
                              disabled={String(removingMemberId) === memberId}
                              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <UserMinus className="h-4 w-4" />
                              {String(removingMemberId) === memberId
                                ? 'Đang xoá...'
                                : 'Xoá'}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[30px] border border-red-200 bg-red-50 p-5">
                  <div className="mb-2 text-base font-black text-red-700">
                    Rời nhóm
                  </div>
                  <p className="mb-4 text-sm text-red-600">
                    Bạn sẽ rời khỏi nhóm chat này.
                  </p>

                  <button
                    type="button"
                    onClick={onLeaveGroup}
                    disabled={isLeavingGroup}
                    className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLeavingGroup ? 'Đang xử lý...' : 'Rời nhóm'}
                  </button>
                </div>
              </div>

              {isGroupAdmin ? (
                <div className="flex flex-col rounded-[30px] border border-slate-200 p-5">
                  <div className="mb-4 text-base font-black text-slate-900">
                    Thêm thành viên
                  </div>

                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm người để thêm..."
                      className="w-full bg-transparent outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredCandidates.slice(0, 6).map((user) => {
                      const uid = String(user?._id || '');
                      const active = selectedIds.includes(uid);

                      return (
                        <button
                          key={uid}
                          type="button"
                          onClick={() => toggleUser(uid)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            active
                              ? 'border-amber-300 bg-amber-50'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <UserAvatar user={user} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-slate-900">
                              {user?.fullName || user?.email}
                            </div>
                            <div className="truncate text-sm text-slate-500">
                              {user?.email || user?.username}
                            </div>
                          </div>

                          {active ? (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewMembers}
                    disabled={!selectedIds.length || isAddingMembers}
                    className="mt-4 inline-flex items-center gap-2 self-start rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAddingMembers ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {isAddingMembers ? 'Đang thêm...' : 'Thêm thành viên'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ManageGroupModal;