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
    toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
    console.error('[Google Auth Error] Login Failed');
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        text="continue_with"
        shape="pill" 
      />
    </div>
  );
}