import { useEffect, useMemo, useState } from 'react';

const FIELD_CONFIG = {
  systemEnabled: {
    label: 'Thông báo hệ thống',
    description: 'Thông báo chung từ nền tảng và quản trị viên.',
  },
  followEnabled: {
    label: 'Thông báo theo dõi',
    description: 'Nhận thông báo khi ai đó theo dõi bạn.',
  },
  projectEnabled: {
    label: 'Cập nhật dự án',
    description: 'Cập nhật quan trọng liên quan đến các dự án.',
  },
  organizerRequestEnabled: {
    label: 'Cập nhật yêu cầu tổ chức',
    description: 'Thay đổi trạng thái cho ứng dụng tổ chức của bạn.',
  },
};

function getVisibleFieldsByRole(role) {
  const normalizedRole = String(role || '').toLowerCase();

  if (normalizedRole === 'organizer') {
    return ['systemEnabled', 'projectEnabled', 'organizerRequestEnabled'];
  }

  if (normalizedRole === 'user') {
    return ['systemEnabled', 'followEnabled', 'projectEnabled'];
  }

  return [];
}

function ToggleRow({ label, description, checked, onChange, name }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-amber-400" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function NotificationSettingsForm({
  settings,
  onSubmit,
  isSaving = false,
  role = '',
}) {
  const [form, setForm] = useState(settings || {});

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  const visibleFields = useMemo(() => getVisibleFieldsByRole(role), [role]);

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = visibleFields.reduce((accumulator, field) => {
      accumulator[field] = Boolean(form[field]);
      return accumulator;
    }, {});

    onSubmit(payload);
  };

  if (!visibleFields.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Cài đặt thông báo không khả dụng cho loại tài khoản này.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {visibleFields.map((field) => {
        const config = FIELD_CONFIG[field];

        return (
          <ToggleRow
            key={field}
            name={field}
            label={config.label}
            description={config.description}
            checked={Boolean(form[field])}
            onChange={handleChange}
          />
        );
      })}

      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-500">
          Những thay đổi chỉ ảnh hưởng đến thông báo trong ứng dụng.
        </p>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </form>
  );
}