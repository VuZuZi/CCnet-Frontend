import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button/Button';
import { useForgotPassword, useVerifyPasswordOTP, useResetPassword } from '../hooks/usePasswordManagement';

const STEPS = {
  EMAIL: 1,
  OTP: 2,
  NEW_PASSWORD: 3,
  SUCCESS: 4,
};

export function ForgotPasswordPage() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const forgotMutation = useForgotPassword();
  const verifyMutation = useVerifyPasswordOTP();
  const resetMutation = useResetPassword();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Please enter your email.');
    try {
      await forgotMutation.mutateAsync(email.trim().toLowerCase());
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) return setError('Please enter the OTP code.');
    try {
      const result = await verifyMutation.mutateAsync({ email: email.trim().toLowerCase(), otp: otp.trim() });
      setResetToken(result.data?.resetToken);
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    try {
      await resetMutation.mutateAsync({ token: resetToken, newPassword });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please start again.');
    }
  };

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60">

          {/* Back link */}
          {step !== STEPS.SUCCESS && (
            <Link
              to="/login"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          )}

          {/* Step indicator */}
          {step !== STEPS.SUCCESS && (
            <div className="mb-6 flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-200'
                      : step > s
                        ? 'bg-emerald-400 text-white'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`h-0.5 w-8 rounded-full ${step > s ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === STEPS.EMAIL && (
            <>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <Mail size={22} className="text-amber-500" />
              </div>
              <h1 className="mt-3 text-2xl font-black text-slate-900">Forgot Password?</h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter your email and we'll send you a 6-digit reset code.
              </p>

              <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  variant="yellow"
                  size="lg"
                  className="w-full rounded-2xl font-bold"
                  isLoading={forgotMutation.isPending}
                >
                  Send Reset Code
                </Button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === STEPS.OTP && (
            <>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <KeyRound size={22} className="text-amber-500" />
              </div>
              <h1 className="mt-3 text-2xl font-black text-slate-900">Enter Reset Code</h1>
              <p className="mt-1 text-sm text-slate-500">
                We sent a 6-digit code to <strong>{email}</strong>. Check your inbox (and spam folder).
              </p>

              <form onSubmit={handleVerifyOTP} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">6-digit OTP code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`${inputClass} text-center text-2xl font-black tracking-[0.5em]`}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  variant="yellow"
                  size="lg"
                  className="w-full rounded-2xl font-bold"
                  isLoading={verifyMutation.isPending}
                >
                  Verify Code
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep(STEPS.EMAIL); setError(''); setOtp(''); }}
                  className="w-full text-center text-sm text-slate-400 hover:text-slate-700"
                >
                  Wrong email? Go back
                </button>
              </form>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === STEPS.NEW_PASSWORD && (
            <>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <Lock size={22} className="text-amber-500" />
              </div>
              <h1 className="mt-3 text-2xl font-black text-slate-900">Set New Password</h1>
              <p className="mt-1 text-sm text-slate-500">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={`${inputClass} pr-11`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className={inputClass}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  variant="yellow"
                  size="lg"
                  className="w-full rounded-2xl font-bold"
                  isLoading={resetMutation.isPending}
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === STEPS.SUCCESS && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Password Reset!</h1>
              <p className="mt-2 text-sm text-slate-500">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 shadow-md shadow-amber-200 transition-colors hover:bg-amber-500"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
