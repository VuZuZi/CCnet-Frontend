import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../api/userAPI";
import { useToast } from "@/shared/contexts/ToastContext";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { getErrorMessage } from "@/shared/lib/httpClient";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (updatedUser) => {
      const resolvedUserId = updatedUser?._id || updatedUser?.id || null;

      queryClient.setQueryData(["profile", "me"], updatedUser);

      if (resolvedUserId) {
        queryClient.setQueryData(["profile", resolvedUserId], updatedUser);
      }

      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

      if (resolvedUserId) {
        queryClient.invalidateQueries({
          queryKey: ["profile", resolvedUserId],
        });
      }

      useAuthStore.setState((state) => ({
        ...state,
        user: updatedUser,
      }));

      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export default useUpdateProfile;