import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/shared/contexts/ToastContext";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import {
  organizerRequestAPI,
  getErrorMessage,
} from "../api/organizerRequestAPI";
import { organizerRequestSchema } from "../validations/organizerRequestSchema";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size || 0,
        dataUrl: reader.result,
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getFirstErrorMessage = (errors) => {
  const visit = (obj) => {
    if (!obj || typeof obj !== "object") return null;

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value?.message) return value.message;
      const nested = visit(value);
      if (nested) return nested;
    }
    return null;
  };

  return visit(errors);
};

export function useOrganizerRequestForm(existingRequest = null) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(authSelectors.user);

  const defaultValues = useMemo(
    () => ({
      fullNameSnapshot: existingRequest?.fullNameSnapshot || currentUser?.fullName || "",
      emailSnapshot: existingRequest?.emailSnapshot || currentUser?.email || "",
      phoneSnapshot: existingRequest?.phoneSnapshot || currentUser?.phone || "",
      locationSnapshot: existingRequest?.locationSnapshot || currentUser?.location || "",

      organizationName: existingRequest?.organizationName || "",
      organizationType: existingRequest?.organizationType || "COMMUNITY",
      organizationWebsite: existingRequest?.organizationWebsite || "",

      idCardFront: existingRequest?.idCardFront ?? undefined,
      idCardBack: existingRequest?.idCardBack ?? undefined,
      businessLicense: existingRequest?.businessLicense ?? undefined,
      bankProof: existingRequest?.bankProof ?? undefined,

      bankName: existingRequest?.bankName || "",
      bankAccountNumber: existingRequest?.bankAccountNumber || "",
      bankAccountName: existingRequest?.bankAccountName || "",

      notes: existingRequest?.notes || "",
    }),
    [existingRequest, currentUser]
  );

  const form = useForm({
    resolver: zodResolver(organizerRequestSchema),
    defaultValues,
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: organizerRequestAPI.submitRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizer-request", "me"] });
      toast.success("Đã gửi hồ sơ Organizer thành công");
      navigate("/organizer/request");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onDocumentChange = async (fieldName, file) => {
    if (!file) return;

    try {
      const payload = await readFileAsDataUrl(file);
      form.setValue(fieldName, payload, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch {
      toast.error("Không thể đọc file. Vui lòng thử lại.");
    }
  };

  const onValid = async (values) => {
    const payload = { ...values };

    if (!payload.businessLicense) delete payload.businessLicense;
    if (!payload.bankProof) delete payload.bankProof;

    await mutation.mutateAsync(payload);
  };

  const onInvalid = (errors) => {
    const firstError = getFirstErrorMessage(errors);
    toast.error(firstError || "Vui lòng kiểm tra lại các trường bắt buộc");
  };

  return {
    form,
    onSubmit: form.handleSubmit(onValid, onInvalid),
    onDocumentChange,
    isSubmitting: mutation.isPending,
  };
}

export default useOrganizerRequestForm;