import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../api/userAPI";

export const useProfile = (userId = null) => {
  return useQuery({
    queryKey: ["profile", userId || "me"],
    queryFn: () => userAPI.getProfile(userId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export default useProfile;