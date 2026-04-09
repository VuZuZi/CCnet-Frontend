import { useEffect, useMemo, useState } from 'react';

const FIELD_CONFIG = {
  systemEnabled: {
    label: 'System announcements',
    description: 'General notices from the platform and admin.',
  },
  followEnabled: {
    label: 'Follow notifications',
    description: 'Get notified when someone follows you.',
  },
  projectEnabled: {
    label: 'Project updates',
    description: 'Important updates related to projects.',
  },
  organizerRequestEnabled: {
    label: 'Organizer request updates',
    description: 'Status changes for your organizer application.',
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
        Notification settings are not available for this account type.
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
          Changes affect in-app notifications only.
        </p>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}