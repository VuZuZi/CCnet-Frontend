import { useMutation, useQueryClient } from "@tanstack/react-query";
import { volunteerAPI } from "../api/volunteerAPI";
import { volunteerQueryKeys } from "./useVolunteerQueries";
import { PROJECT_QUERY_KEYS } from "@/features/project/hooks/useProjectQueries";

export const useVolunteerMutations = () => {
  const queryClient = useQueryClient();

  const invalidateVolunteerQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: volunteerQueryKeys.applicationRoot,
      }),
      queryClient.invalidateQueries({
        queryKey: volunteerQueryKeys.projectApplicationsRoot,
      }),
      queryClient.invalidateQueries({
        queryKey: volunteerQueryKeys.pendingApplicationsRoot,
      }),
      queryClient.invalidateQueries({
        queryKey: volunteerQueryKeys.supportedProjectsRoot,
      }),
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.all,
      }),
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.featured,
      }),
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.volunteerNeeded,
      }),
    ]);
  };

  const createApplicationMutation = useMutation({
    mutationFn: (data) => volunteerAPI.createApplication(data),
    onSuccess: invalidateVolunteerQueries,
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ id, data }) => volunteerAPI.updateApplication(id, data),
    onSuccess: invalidateVolunteerQueries,
  });

  const cancelApplicationMutation = useMutation({
    mutationFn: (id) => volunteerAPI.cancelApplication(id),
    onSuccess: invalidateVolunteerQueries,
  });

  const requestWithdrawMutation = useMutation({
    mutationFn: ({ id, reason }) => volunteerAPI.requestWithdraw(id, reason),
    onSuccess: invalidateVolunteerQueries,
  });

  const approveApplicationMutation = useMutation({
    mutationFn: (payload) => {
      const id =
        typeof payload === "object" && payload !== null ? payload.id : payload;
      return volunteerAPI.approveApplication(id);
    },
    onSuccess: invalidateVolunteerQueries,
  });

  const rejectApplicationMutation = useMutation({
    mutationFn: ({ id, reason }) => volunteerAPI.rejectApplication(id, reason),
    onSuccess: invalidateVolunteerQueries,
  });

  const restoreApplicationMutation = useMutation({
    mutationFn: ({ id }) => volunteerAPI.restoreApplication(id),
    onSuccess: invalidateVolunteerQueries,
  });

  const approveWithdrawMutation = useMutation({
    mutationFn: ({ id }) => volunteerAPI.approveWithdraw(id),
    onSuccess: invalidateVolunteerQueries,
  });

  const rejectWithdrawMutation = useMutation({
    mutationFn: ({ id, reviewNote }) =>
      volunteerAPI.rejectWithdraw(id, reviewNote),
    onSuccess: invalidateVolunteerQueries,
  });

  return {
    createApplication: createApplicationMutation.mutateAsync,
    isCreating: createApplicationMutation.isPending,

    updateApplication: updateApplicationMutation.mutateAsync,
    isUpdating: updateApplicationMutation.isPending,

    cancelApplication: cancelApplicationMutation.mutateAsync,
    isCancelling: cancelApplicationMutation.isPending,

    requestWithdraw: requestWithdrawMutation.mutateAsync,
    isRequestingWithdraw: requestWithdrawMutation.isPending,

    approveApplication: approveApplicationMutation.mutateAsync,
    isApproving: approveApplicationMutation.isPending,

    rejectApplication: rejectApplicationMutation.mutateAsync,
    isRejecting: rejectApplicationMutation.isPending,

    restoreApplication: restoreApplicationMutation.mutateAsync,
    isRestoring: restoreApplicationMutation.isPending,

    approveWithdraw: approveWithdrawMutation.mutateAsync,
    isApprovingWithdraw: approveWithdrawMutation.isPending,

    rejectWithdraw: rejectWithdrawMutation.mutateAsync,
    isRejectingWithdraw: rejectWithdrawMutation.isPending,
  };
};

export default useVolunteerMutations;