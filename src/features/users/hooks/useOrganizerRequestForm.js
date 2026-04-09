import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/shared/contexts/ToastContext";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { organizerRequestAPI, getErrorMessage } from "../api/organizerRequestAPI";
import { organizerRequestSchema } from "../validations/organizerRequestSchema";
import { queryKeys } from "@/shared/constants/queryKeys";

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
      selfie: existingRequest?.selfie ?? undefined,
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.organizerRequests.me() });
      toast.success("Application submitted successfully. Moving to verification.");
    },
    onError: async (error) => {
      if (error.response?.status === 409) {
        toast.info("You already have a pending application. Updating your view...");
        await queryClient.invalidateQueries({ queryKey: queryKeys.organizerRequests.me() });
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });

  const onDocumentChange = (fieldName, documentObject) => {
    form.setValue(fieldName, documentObject, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onValid = async (values) => {
    const payload = { ...values };

    if (!payload.businessLicense) delete payload.businessLicense;
    if (!payload.bankProof) delete payload.bankProof;

    await mutation.mutateAsync(payload);
  };

  const onInvalid = (errors) => {
    const firstError = getFirstErrorMessage(errors);
    toast.error(firstError || "Please check the highlighted required fields.");
  };

  return {
    form,
    onSubmit: form.handleSubmit(onValid, onInvalid),
    onDocumentChange,
    isSubmitting: mutation.isPending,
  };
}

export default useOrganizerRequestForm;