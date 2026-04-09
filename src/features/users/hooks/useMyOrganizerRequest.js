import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { organizerRequestAPI } from "../api/organizerRequestAPI";
import { userAPI } from "../api/userAPI";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export function useMyOrganizerRequest(enabled = true) {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  const query = useQuery({
    queryKey: ["organizer-request", "me"],
    queryFn: organizerRequestAPI.getMyLatestRequest,
    enabled,
    staleTime: 0,
    
    refetchOnWindowFocus: "always", 
    refetchOnReconnect: "always",
    
    refetchIntervalInBackground: true, 
    
    refetchInterval: (queryInstance) => {
      const status = queryInstance.state?.data?.status;
      
      if (!status) return 5000; 

      const transitionalStates = [
        "SYSTEM_CHECKING", 
        "AWAITING_MICRO_DEPOSIT", 
        "PENDING"
      ];
      return transitionalStates.includes(status) ? 5000 : false;
    },
  });

  useEffect(() => {
    const status = query.data?.status;

    if (status === "APPROVED") {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

      userAPI
        .getProfile()
        .then((freshUser) => {
          if (freshUser) {
            updateUser?.(freshUser);
          }
        })
        .catch(() => {});
    }
  }, [query.data?.status, queryClient, updateUser]);

  return {
    request: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export default useMyOrganizerRequest;