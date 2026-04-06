import NotificationSettingsForm from '../components/NotificationSettingsForm';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

export default function NotificationSettingsPage() {
  const { settingsQuery, updateSettings } = useNotificationSettings();

  if (settingsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading notification settings...
        </div>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Failed to load notification settings.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Notification settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage which notifications you want to receive in the app.
        </p>
      </div>

      <NotificationSettingsForm
        settings={settingsQuery.data}
        onSubmit={(values) => updateSettings.mutate(values)}
        isSaving={updateSettings.isPending}
      />

      {updateSettings.isSuccess && (
        <p className="mt-3 text-sm text-green-600">Settings updated successfully.</p>
      )}

      {updateSettings.isError && (
        <p className="mt-3 text-sm text-red-600">Failed to update settings.</p>
      )}
    </div>
  );
}