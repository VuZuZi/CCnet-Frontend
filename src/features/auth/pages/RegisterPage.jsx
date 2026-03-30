import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators, VALIDATION_MESSAGES } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button';
import { AuthLayout } from '@/shared/components/layouts/AuthLayout';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register, isLoading, isError, errorMessage } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { fullName: '', email: '', password: '', confirmPassword: '' },
    {
      fullName: [validators.required, validators.fullName],
      email: [validators.required, validators.email],
      password: [validators.required, validators.password],
      confirmPassword: [
        validators.required,
        (value, allValues) => {
          if (value !== allValues.password) {
            return VALIDATION_MESSAGES.PASSWORD.MISMATCH;
          }
          return null;
        },
      ],
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateAll()) {
      register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
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
      title={t('auth.create_account')}
      subtitle={t('auth.register_subtitle')}
    >
      {isError && errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 border border-red-100 font-medium text-sm">
          {getTranslatedError(errorMessage)}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full mt-4">
        <fieldset disabled={isLoading} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">{t('auth.full_name')}</label>
            <input
              type="text"
              placeholder={t('auth.full_name_placeholder')}
              value={values.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${touched.fullName && !!errors.fullName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
                }`}
            />
            {renderError('fullName')}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">{t('auth.email')}</label>
            <input
              type="email"
              placeholder={t('auth.email_placeholder')}
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${touched.email && !!errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
                }`}
            />
            {renderError('email')}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">{t('auth.password')}</label>
            <div className="relative group/field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`block w-full rounded-full border bg-slate-50/50 py-3.5 pl-6 pr-12 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${touched.password && !!errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white'
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded-full hover:bg-amber-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {renderError('password')}
            <p className="text-slate-400 text-[11px] mt-1.5 ml-4 font-medium">
              {t('auth.password_requirement')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">{t('auth.confirm_password')}</label>
            <div className="relative group/field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirm_password_placeholder')}
                value={values.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`block w-full rounded-full border bg-slate-50/50 py-3.5 pl-6 pr-12 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${touched.confirmPassword && !!errors.confirmPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white'
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded-full hover:bg-amber-50"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {renderError('confirmPassword')}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full !py-4 !text-base !rounded-full !mt-6 shadow-lg shadow-amber-500/20 font-bold"
            isLoading={isLoading}
          >
            {t('auth.register_button')}
          </Button>

        </fieldset>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <p>
            {t('auth.have_account')}{' '}
            <Link to={ROUTES.LOGIN} className="text-slate-900 hover:text-amber-600 underline underline-offset-2 transition-colors">
              {t('auth.login')}
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