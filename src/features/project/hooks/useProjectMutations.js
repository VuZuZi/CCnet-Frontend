import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { projectAPI } from "../api/projectAPI";
import { PROJECT_QUERY_KEYS } from "./useProjectQueries";
import { useToast } from "@/shared/contexts/ToastContext";
import { getErrorMessage } from "@/shared/lib/httpClient";
import { useProjectDraftStore } from "../stores/useProjectDraftStore";

const invalidateAllProjectQueries = (queryClient) =>
  queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });

export const useCreateDraftProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const setProjectId = useProjectDraftStore((state) => state.setProjectId);

  return useMutation({
    mutationFn: (variables = {}) => {
      const { silent, ...payload } = variables;
      void silent;
      return projectAPI.createDraft(payload);
    },
    onSuccess: (data, variables) => {
      if (data?._id) {
        setProjectId(data._id);
        queryClient.setQueryData(PROJECT_QUERY_KEYS.draftDetail(data._id), data);
      }

      invalidateAllProjectQueries(queryClient);

      if (!variables?.silent) {
        toast.success("Đã lưu bản nháp dự án (Bước 1)");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateDraftProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables = {}) => {
      const { id, data, silent } = variables;
      void silent;
      return projectAPI.updateDraft({ id, data });
    },
    onSuccess: (data, variables) => {
      if (variables?.id) {
        queryClient.setQueryData(
          PROJECT_QUERY_KEYS.draftDetail(variables.id),
          data,
        );
      }

      invalidateAllProjectQueries(queryClient);

      if (!variables?.silent) {
        toast.success("Đã cập nhật bản nháp thành công");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useSubmitProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const resetDraft = useProjectDraftStore((state) => state.resetDraft);

  return useMutation({
    mutationFn: projectAPI.submitForApproval,
    onSuccess: (data, projectId) => {
      if (projectId) {
        queryClient.setQueryData(PROJECT_QUERY_KEYS.detail(projectId), data);
        queryClient.setQueryData(PROJECT_QUERY_KEYS.draftDetail(projectId), data);
      }

      invalidateAllProjectQueries(queryClient);
      resetDraft();
      toast.success("Đã gửi dự án để chờ duyệt thành công!");
      navigate("/projects");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateUpdatingProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables = {}) => {
      const { id, data } = variables;
      return projectAPI.updateUpdating({ id, data });
    },
    onSuccess: (data, variables) => {
      if (variables?.id) {
        queryClient.setQueryData(
          PROJECT_QUERY_KEYS.updatingDetail(variables.id),
          data,
        );
        queryClient.setQueryData(PROJECT_QUERY_KEYS.detail(variables.id), data);
      }

      invalidateAllProjectQueries(queryClient);
      toast.success("Đã cập nhật mốc hoạt động của dự án");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useConfirmUpdatingProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectAPI.confirmUpdating,
    onSuccess: (data, projectId) => {
      if (projectId) {
        queryClient.setQueryData(PROJECT_QUERY_KEYS.updatingDetail(projectId), data);
        queryClient.setQueryData(PROJECT_QUERY_KEYS.detail(projectId), data);
      }

      invalidateAllProjectQueries(queryClient);
      toast.success("Đã gửi xác nhận cập nhật cho quản trị viên");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useReportProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }) =>
      projectAPI.reportProject(projectId, payload),
    onSuccess: (_, variables) => {
      if (variables?.projectId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_QUERY_KEYS.detail(variables.projectId),
        });
      }

      toast.success("Báo cáo dự án đã được gửi. Cảm ơn bạn đã thông báo.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Báo cáo dự án thất bại");
      throw error;
    },
  });
};
