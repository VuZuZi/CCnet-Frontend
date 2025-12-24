import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useToast } from '@/shared/contexts/ToastContext';

export function GoogleLoginButton() {
  const { loginWithGoogle } = useGoogleLogin();
  const toast = useToast();

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      loginWithGoogle({ idToken: credentialResponse.credential });
    }
  };

  const handleError = () => {
    toast.error('Google Sign In was unsuccessful. Please try again.');
    console.error('Google Login Failed');
  };

  return (
    <div className="w-100 d-flex justify-content-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}