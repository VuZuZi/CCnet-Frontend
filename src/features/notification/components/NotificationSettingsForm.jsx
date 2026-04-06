import { useEffect, useState } from 'react';

const FIELD_LABELS = {
  systemEnabled: 'System notifications',
  followEnabled: 'Follow notifications',
  projectEnabled: 'Project notifications',
  organizerRequestEnabled: 'Organizer request notifications',
};

export default function NotificationSettingsForm({
  settings,
  onSubmit,
  isSaving = false,
}) {
  const [form, setForm] = useState(settings || {});

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {Object.entries(FIELD_LABELS).map(([field, label]) => (
        <label key={field} className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <input
            type="checkbox"
            name={field}
            checked={Boolean(form[field])}
            onChange={handleChange}
            className="h-4 w-4"
          />
        </label>
      ))}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? 'Saving...' : 'Save settings'}
      </button>
    </form>
  );
}