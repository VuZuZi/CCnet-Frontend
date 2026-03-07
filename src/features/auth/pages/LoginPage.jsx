import { Link, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Button } from '@/shared/components/ui/Button/Button'; 

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
      <p className="text-[#dc3545] text-sm mt-1 mb-0">{errors[field]}</p>
    ) : null
  );

  return (
    <div className="min-h-screen flex items-center bg-off-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-transparent transition-all duration-200 focus-within:shadow-md focus-within:border-yellow p-8 sm:p-10">
          
          <header className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-black">Welcome Back</h2>
            <p className="text-gray text-base">Login to your account to continue</p>
          </header>

          <div aria-live="polite">
            {location.state?.verified && (
              <div className="bg-[#d1e7dd] text-[#0f5132] p-4 rounded-lg mb-6 border border-[#badbcc]">
                Email verified successfully! Please login.
              </div>
            )}

            {isError && errorMessage && (
              <div className="bg-[#f8d7da] text-[#842029] p-4 rounded-lg mb-6 border border-[#f5c2c7] relative">
                {errorMessage}
              </div>
            )}
          </div>

          <div className={`mb-6 ${isLoading ? 'pointer-events-none opacity-60 cursor-not-allowed' : ''}`}>
             <GoogleLoginButton />
          </div>

          <div className="relative mb-6">
            <hr className="border-t border-light-gray" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray whitespace-nowrap">
              Or continue with email
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isLoading} className="space-y-6">
              
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-black mb-1.5">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="username"
                  className={`block w-full rounded-md border py-2 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
                    touched.email && !!errors.email 
                      ? 'border-[#dc3545] focus:ring-[#dc3545]' 
                      : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('email')}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-black mb-1.5">
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
                  className={`block w-full rounded-md border py-2 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
                    touched.password && !!errors.password 
                      ? 'border-[#dc3545] focus:ring-[#dc3545]' 
                      : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('password')}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-light-gray text-yellow focus:ring-yellow cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-black cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-medium text-black hover:text-orange transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="yellow"
                className="w-full !py-3 !text-lg"
                isLoading={isLoading}
              >
                Sign In
              </Button>

            </fieldset>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray text-sm mb-0">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="font-bold text-black hover:text-orange transition-colors">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}