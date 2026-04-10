import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import NotificationSettingsForm from './NotificationSettingsForm';

export default function NotificationSettingsModal({
  isOpen,
  onClose,
  onBackdropClose,
}) {
  const user = useAuthStore(authSelectors.user);
  const role = String(user?.role || '').toLowerCase();

  const { settingsQuery, updateSettings, resetUpdateState } = useNotificationSettings();
  const isAllowedRole = role === 'user' || role === 'organizer';

  useEffect(() => {
    if (!isOpen) return;

    resetUpdateState?.();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, resetUpdateState]);

  const handleClose = () => {
    resetUpdateState?.();
    onClose?.();
  };

  const handleBackdropClose = () => {
    resetUpdateState?.();
    if (onBackdropClose) {
      onBackdropClose();
      return;
    }
    onClose?.();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[3px] sm:p-6"
      onClick={handleBackdropClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Notification settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage which notifications you want to receive in the app.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
          {!isAllowedRole ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Notification settings are available for user and organizer accounts only.
            </div>
          ) : settingsQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading notification settings...
            </div>
          ) : settingsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              Failed to load notification settings.
            </div>
          ) : (
            <>
              <NotificationSettingsForm
                settings={settingsQuery.data}
                role={role}
                onSubmit={(values) => updateSettings.mutate(values)}
                isSaving={updateSettings.isPending}
              />

              {updateSettings.isSuccess && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Settings updated successfully.
                </div>
              )}

              {updateSettings.isError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  Failed to update settings.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}