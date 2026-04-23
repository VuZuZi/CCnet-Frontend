import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, Search, Users, X } from 'lucide-react';
import {
  buildUniqueUsers,
  filterUsers,
} from '../../utils/group';

function SimpleUserAvatar({ user }) {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt="avatar"
        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
      />
    );
  }

  const label = (user?.fullName || user?.email || '?')
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-bold text-slate-700">
      {label}
    </div>
  );
}

export function CreateGroupModal({
  open,
  onClose,
  conversations = [],
  myId,
  onCreateGroup,
  isCreating = false,
}) {
  const [groupName, setGroupName] = useState('');
  const [groupAvatarFile, setGroupAvatarFile] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!open) {
      setGroupName('');
      setGroupAvatarFile(null);
      setGroupAvatarPreview('');
      setKeyword('');
      setSelectedIds([]);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (groupAvatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(groupAvatarPreview);
      }
    };
  }, [groupAvatarPreview]);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const candidates = useMemo(() => {
    return buildUniqueUsers(conversations, myId);
  }, [conversations, myId]);

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

  const canSubmit =
    Boolean(groupName.trim()) &&
    selectedIds.length >= 2 &&
    !isCreating;

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

  const handleSubmit = async () => {
    if (!canSubmit) return;

    await onCreateGroup?.({
      type: 'group',
      groupName: groupName.trim(),
      groupAvatarFile,
      participantIds: selectedIds,
    });
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[7000]"
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        aria-label="Đóng modal tạo nhóm"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
      />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center px-4 py-6 md:py-10">
          <div
            className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] max-h-[calc(100dvh-32px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">
                    Tạo nhóm chat
                  </div>
                  <div className="text-sm text-slate-500">
                    Chọn thành viên và đặt tên cho nhóm mới
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                  {groupAvatarPreview ? (
                    <img
                      src={groupAvatarPreview}
                      alt="Ảnh đại diện nhóm"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-slate-400" />
                  )}
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  <ImagePlus className="h-4 w-4" />
                  Thêm ảnh nhóm
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nhập tên nhóm..."
                className="mb-5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              />

              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm thành viên..."
                  className="w-full outline-none"
                />
              </div>

              {selectedIds.length > 0 && selectedIds.length < 2 ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  Nhóm chat cần ít nhất 2 thành viên.
                </div>
              ) : null}

              <div className="space-y-2">
                {filteredCandidates.map((user) => {
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
                      <SimpleUserAvatar user={user} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">
                          {user?.fullName || user?.email}
                        </div>
                        <div className="truncate text-sm text-slate-500">
                          {user?.email || user?.username}
                        </div>
                      </div>

                      {active ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo nhóm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CreateGroupModal;
