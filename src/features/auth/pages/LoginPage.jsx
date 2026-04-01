import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../hooks/useLogin';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Button } from '@/shared/components/ui/Button/Button'; 
import { AuthLayout } from '@/shared/components/layouts/AuthLayout'; 

export function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { login, isLoading, isError, errorMessage } = useLogin();

  const loginValidationSchema = {
    email: [validators.required, validators.email],
    password: [validators.required],
  };

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { email: '', password: '' },
    loginValidationSchema
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      login(values); 
    }
  };

  const renderError = (field) => (
    touched[field] && errors[field] ? (
      <p className="text-red-500 text-xs mt-1.5 ml-4 font-medium">{t(errors[field])}</p>
    ) : null
  );

  const getTranslatedError = (error) => {
    const errorMap = {
      'Email already registered': t('auth.email_already_registered'),
      'User not found': t('auth.user_not_found'),
      'Invalid OTP': t('auth.invalid_otp'),
      'OTP expired or invalid': t('auth.otp_expired'),
      'Account is already verified': t('auth.already_verified'),
    };
    return errorMap[error] || error;
  };

  return (
    <AuthLayout
      title={t('auth.welcome_back')}
      subtitle={t('auth.login_subtitle')}
    >
      <div aria-live="polite">
        {location.state?.verified && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-6 border border-emerald-100 font-medium text-sm">
            {t('auth.verified_success')}
          </div>
        )}

        {isError && errorMessage && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 border border-red-100 font-medium text-sm">
            {getTranslatedError(errorMessage)}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full mt-4">
        <fieldset disabled={isLoading} className="space-y-5">

          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              type="email"
              placeholder={t('auth.email_placeholder')}
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="username"
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${touched.email && !!errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
                }`}
            />
            {renderError('email')}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">
              {t('auth.password')}
            </label>
            <input
              id="login-password"
              type="password"
              placeholder={t('auth.password_placeholder_dots')}
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="current-password"
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${touched.password && !!errors.password
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
                }`}
            />
            {renderError('password')}

            <div className="flex justify-end mt-2 mr-4">
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-bold text-slate-400 hover:text-amber-600 transition-colors">
                {t('auth.forgot_password')}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full !py-4 !text-base !rounded-full !mt-2 shadow-lg shadow-amber-500/20 font-bold"
            isLoading={isLoading}
          >
            {t('auth.login_button')}
          </Button>
        </fieldset>

        <div className="mt-8">
          <div className="relative mb-6">
            <hr className="border-t border-slate-200" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-semibold text-slate-400">
              {t('auth.or_separator')}
            </span>
          </div>
          <div className={`flex justify-center ${isLoading ? 'pointer-events-none opacity-60' : ''}`}>
            <GoogleLoginButton />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <p>
            {t('auth.no_account')}{' '}
            <Link to={ROUTES.REGISTER} className="text-slate-900 hover:text-amber-600 underline underline-offset-2 transition-colors">
              {t('auth.register')}
            </Link>
          </p>
          <Link to="#" className="hover:text-slate-900 underline underline-offset-2 transition-colors">
            {t('auth.terms_conditions')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}