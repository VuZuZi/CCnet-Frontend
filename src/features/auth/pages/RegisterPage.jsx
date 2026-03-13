import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators, VALIDATION_MESSAGES } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button';
import { AuthLayout } from '@/shared/components/layouts/AuthLayout';

export function RegisterPage() {
  const { register, isLoading, isError, errorMessage } = useRegister();

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
      <p className="text-red-500 text-xs mt-1.5 ml-4 font-medium">{errors[field]}</p>
    ) : null
  );

  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Đăng ký tài khoản để tham gia mạng lưới tình nguyện và lan tỏa yêu thương."
    >
      {isError && errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 border border-red-100 font-medium text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full mt-4">
        <fieldset disabled={isLoading} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">Full Name</label>
            <input
              type="text"
              placeholder="Nhập họ và tên của bạn"
              value={values.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${
                touched.fullName && !!errors.fullName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white' 
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {renderError('fullName')}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${
                touched.email && !!errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white' 
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {renderError('email')}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">Password</label>
            <input
              type="password"
              placeholder="Tạo mật khẩu an toàn"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${
                touched.password && !!errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white' 
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {renderError('password')}
            <p className="text-slate-400 text-[11px] mt-1.5 ml-4 font-medium">
              Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số & ký tự đặc biệt.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-4">Confirm Password</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={`block w-full rounded-full border bg-slate-50/50 py-3.5 px-6 text-slate-900 text-sm focus:outline-none focus:ring-4 transition-all ${
                touched.confirmPassword && !!errors.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 focus:bg-white' 
                  : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {renderError('confirmPassword')}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full !py-4 !text-base !rounded-full !mt-6 shadow-lg shadow-amber-500/20 font-bold"
            isLoading={isLoading}
          >
            Tạo Tài Khoản
          </Button>

        </fieldset>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <p>
            Đã có tài khoản?{' '}
            <Link to={ROUTES.LOGIN} className="text-slate-900 hover:text-amber-600 underline underline-offset-2 transition-colors">
              Đăng nhập
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