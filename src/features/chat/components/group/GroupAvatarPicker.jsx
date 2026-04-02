import { ImagePlus, Users } from 'lucide-react';

export default function GroupAvatarPicker({
  previewUrl = '',
  onChange,
  label = 'Đổi ảnh đại diện',
}) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="group avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <Users className="h-6 w-6 text-slate-400" />
        )}
      </div>

      <div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
          <ImagePlus className="h-4 w-4" />
          {label}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={onChange}
          />
        </label>
      </div>
    </div>
  );
}