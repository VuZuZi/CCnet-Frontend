import { Loader2 } from 'lucide-react';
import GroupAvatarPicker from './GroupAvatarPicker';

export default function GroupInfoForm({
  groupName,
  onGroupNameChange,
  groupAvatarPreview,
  onAvatarChange,
  onSave,
  isSaving = false,
  avatarButtonLabel = 'Đổi ảnh đại diện',
  canSave = true,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <div className="mb-4 text-base font-black text-slate-900">Thông tin nhóm</div>

      <GroupAvatarPicker
        previewUrl={groupAvatarPreview}
        onChange={onAvatarChange}
        label={avatarButtonLabel}
      />

      <div className="flex gap-3 max-md:flex-col">
        <input
          type="text"
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          placeholder="Nhập tên nhóm..."
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !canSave}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}