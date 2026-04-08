import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button/Button';
import { useChangePassword } from '../hooks/usePasswordManagement';

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const changeMutation = useChangePassword();

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword) return setError('Please enter your current password.');
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    try {
      await changeMutation.mutateAsync({ currentPassword, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change password. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Password Changed!</h1>
          <p className="mt-2 text-sm text-slate-500">Your password has been updated successfully.</p>
          <Link
            to="/profile"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60">
          <Link
            to="/profile"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
            <Lock size={22} className="text-amber-500" />
          </div>
          <h1 className="mt-3 text-2xl font-black text-slate-900">Change Password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your account password. You'll need your current password to proceed.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  className={`${inputClass} pr-11`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                >
                  {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                >
                  {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full rounded-2xl font-bold"
              isLoading={changeMutation.isPending}
            >
              Change Password
            </Button>

            <p className="text-center text-xs text-slate-400">
              Forgot your current password?{' '}
              <Link to="/forgot-password" className="font-medium text-amber-600 hover:underline">
                Reset it here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
