import { Link, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Button } from '@/shared/components/ui/Button/Button'; 
import { AuthLayout } from '@/shared/components/layouts/AuthLayout'; 

export function LoginPage() {
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
      <p className="text-red-500 text-xs mt-1.5 ml-4 font-medium">{errors[field]}</p>
    ) : null
  );

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Đăng nhập để tiếp tục hành trình lan tỏa yêu thương"
    >
      <div aria-live="polite">
        {location.state?.verified && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-6 border border-emerald-100 font-medium text-sm">
            Email đã được xác thực! Vui lòng đăng nhập.
          </div>
        )}

        {isError && errorMessage && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 border border-red-100 font-medium text-sm">
            {errorMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full mt-4">
        <fieldset disabled={isLoading} className="space-y-5">
          
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="username"
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${
                touched.email && !!errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white' 
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {renderError('email')}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="current-password"
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${
                touched.password && !!errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white' 
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {renderError('password')}
            
            <div className="flex justify-end mt-2 mr-4">
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-bold text-slate-400 hover:text-amber-600 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full !py-4 !text-base !rounded-full !mt-2 shadow-lg shadow-amber-500/20 font-bold"
            isLoading={isLoading}
          >
            Đăng Nhập
          </Button>
        </fieldset>

        <div className="mt-8">
          <div className="relative mb-6">
            <hr className="border-t border-slate-200" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-semibold text-slate-400">
              Hoặc
            </span>
          </div>
          <div className={`flex justify-center ${isLoading ? 'pointer-events-none opacity-60' : ''}`}>
            <GoogleLoginButton />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <p>
            Chưa có tài khoản?{' '}
            <Link to={ROUTES.REGISTER} className="text-slate-900 hover:text-amber-600 underline underline-offset-2 transition-colors">
              Đăng ký
            </Link>
          </p>
          <Link to="#" className="hover:text-slate-900 underline underline-offset-2 transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}