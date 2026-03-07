import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators, VALIDATION_MESSAGES } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button'; // Import Shared Button

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
      <p className="text-[#dc3545] text-sm mt-1 mb-0">{errors[field]}</p>
    ) : null
  );

  return (
    <div className="min-h-screen flex items-center bg-off-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-transparent transition-all duration-200 focus-within:shadow-md focus-within:border-yellow p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-black">Create Account</h2>
            <p className="text-gray text-base">Sign up to get started</p>
          </div>

          {isError && errorMessage && (
            <div className="bg-[#f8d7da] text-[#842029] p-4 rounded-lg mb-6 border border-[#f5c2c7]">
              <h6 className="font-bold mb-1">Registration Failed</h6>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isLoading} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={values.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`block w-full rounded-md border py-2 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
                    touched.fullName && !!errors.fullName ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('fullName')}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`block w-full rounded-md border py-2 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
                    touched.email && !!errors.email ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('email')}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`block w-full rounded-md border py-2 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
                    touched.password && !!errors.password ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('password')}
                <p className="text-gray text-xs mt-1.5">
                  Must be 8+ characters with uppercase, lowercase, number & special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`block w-full rounded-md border py-2 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
                    touched.confirmPassword && !!errors.confirmPassword ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('confirmPassword')}
              </div>

              <Button
                type="submit"
                variant="yellow"
                className="w-full !py-3 !text-lg mt-8"
                isLoading={isLoading}
              >
                Create Account
              </Button>

            </fieldset>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray text-sm mb-0">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="font-bold text-black hover:text-orange transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}