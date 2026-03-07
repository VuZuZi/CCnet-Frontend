import { useLocation, Navigate } from 'react-router-dom';
import { useVerifyOTP } from '../hooks/useVerifyOTP';
import { useResendOTP } from '../hooks/useResendOTP';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button'; 

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
      <p className="text-[#dc3545] text-sm mt-1 mb-0">{errors[field]}</p>
    ) : null
  );

  return (
    <div className="min-h-screen flex items-center bg-off-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-transparent transition-all duration-200 focus-within:shadow-md focus-within:border-yellow p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="mb-4 text-5xl" role="img" aria-label="email">
              📧
            </div>
            <h2 className="text-3xl font-bold mb-2 text-black">Verify Your Email</h2>
            <p className="text-gray text-base">
              We've sent a 6-digit code to <strong className="text-black">{email || 'your email'}</strong>
            </p>
          </div>

          {isError && errorMessage && (
            <div className="bg-[#f8d7da] text-[#842029] p-4 rounded-lg mb-6 border border-[#f5c2c7]">
              <h6 className="font-bold mb-1">Verification Failed</h6>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isLoading} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Verification Code</label>
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
                  className={`block w-full rounded-md border py-3 px-4 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors text-2xl tracking-[0.5rem] text-center font-bold ${
                    touched.otp && !!errors.otp ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('otp')}
              </div>

              <Button
                type="submit"
                variant="yellow"
                className="w-full !py-3 !text-lg"
                isLoading={isLoading}
              >
                Verify Email
              </Button>

            </fieldset>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray text-sm mb-0">
              Didn't receive the code?{' '}
              <button
                type="button"
                className={`bg-transparent border-none p-0 font-bold transition-colors ${
                  canResend && !isResending ? 'text-black hover:text-orange cursor-pointer' : 'text-gray opacity-60 cursor-not-allowed'
                }`}
                onClick={handleResend}
                disabled={!canResend || isResending}
              >
                {isResending ? (
                  <span className="flex items-center gap-1 justify-center">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend Code'
                )}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}