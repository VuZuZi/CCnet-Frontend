import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api/authAPI';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email) => authAPI.forgotPassword(email),
  });
}

export function useVerifyPasswordOTP() {
  return useMutation({
    mutationFn: ({ email, otp }) => authAPI.verifyPasswordOTP({ email, otp }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }) => authAPI.resetPassword({ token, newPassword }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authAPI.changePassword({ currentPassword, newPassword }),
  });
}
