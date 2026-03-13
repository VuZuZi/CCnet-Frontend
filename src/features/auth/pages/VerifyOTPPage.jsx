import { useLocation, Navigate } from 'react-router-dom';
import { useVerifyOTP } from '../hooks/useVerifyOTP';
import { useResendOTP } from '../hooks/useResendOTP';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button'; 
import { AuthLayout } from '@/shared/components/layouts/AuthLayout';

export function VerifyOTPPage() {
  const location = useLocation();
  const userId = location.state?.userId;
  const email = location.state?.email;

  const { verifyOTP, isLoading, isError, errorMessage } = useVerifyOTP();
  const { resendOTP, isLoading: isResending } = useResendOTP();

  const { seconds: countdown, startCountdown, isRunning } = useCountdown(0);
  const canResend = !isRunning;

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { otp: '' },
    {
      otp: [validators.required, validators.otp],
    }
  );

  if (!userId) {
    return <Navigate to={ROUTES.REGISTER} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateAll()) {
      verifyOTP({
        userId,
        otp: values.otp,
      });
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;
    try {
        await resendOTP(email);
        startCountdown(60); 
    } catch (error) {
        console.error('Resend OTP failed:', error);
    }
  };

  const renderError = (field) => (
    touched[field] && errors[field] ? (
      <p className="text-red-500 text-xs mt-2 font-medium text-center">{errors[field]}</p>
    ) : null
  );

  return (
    <AuthLayout 
      title="Xác Thực Email" 
      subtitle={`Vui lòng nhập mã 6 số được gửi đến email ${email || 'của bạn'}`}
    >
      {isError && errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 border border-red-100 font-medium text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full mt-4">
        <fieldset disabled={isLoading} className="space-y-6">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 text-center">
              Mã Xác Nhận (OTP)
            </label>
            <input
              type="text"
              placeholder="000000"
              value={values.otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                handleChange('otp', value);
              }}
              onBlur={() => handleBlur('otp')}
              maxLength={6}
              className={`block w-full rounded-full border bg-slate-50/50 py-4 px-6 text-slate-900 focus:outline-none focus:ring-4 transition-all text-3xl tracking-[0.75rem] text-center font-black ${
                touched.otp && !!errors.otp 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white' 
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {renderError('otp')}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full !py-4 !text-base !rounded-full !mt-2 shadow-lg shadow-amber-500/20 font-bold"
            isLoading={isLoading}
          >
            Xác Thực Ngay
          </Button>

        </fieldset>

        <div className="flex items-center justify-center mt-auto pt-8 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <p className="mb-0">
            Chưa nhận được mã?{' '}
            <button
              type="button"
              className={`bg-transparent border-none p-0 font-bold transition-colors underline underline-offset-2 ${
                canResend && !isResending 
                  ? 'text-slate-900 hover:text-amber-600 cursor-pointer' 
                  : 'text-slate-400 cursor-not-allowed no-underline'
              }`}
              onClick={handleResend}
              disabled={!canResend || isResending}
            >
              {isResending ? (
                <span className="flex items-center gap-1 justify-center">
                  <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi...
                </span>
              ) : countdown > 0 ? (
                `Gửi lại sau ${countdown}s`
              ) : (
                'Gửi Lại Mã'
              )}
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}