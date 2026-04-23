import { useEffect, useMemo } from "react";
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
import { queryKeys } from "@/shared/constants/queryKeys";

const normalizeDocument = (doc) => {
  if (!doc || typeof doc !== "object") return undefined;

  const normalized = {
    fileName: typeof doc.fileName === "string" ? doc.fileName : "",
    mimeType: typeof doc.mimeType === "string" ? doc.mimeType : "",
    size: Number(doc.size || 0),
    ...(doc.url ? { url: doc.url } : {}),
    ...(doc.dataUrl ? { dataUrl: doc.dataUrl } : {}),
  };

  if (!normalized.fileName || !normalized.mimeType) return undefined;
  if (!normalized.url && !normalized.dataUrl) return undefined;

  return normalized;
};

const normalizeLocation = (location) => {
  if (!location || typeof location !== "object") return null;

  const address =
    typeof location.address === "string" ? location.address.trim() : "";
  const coordinates = Array.isArray(location.coordinates)
    ? location.coordinates.map((value) => Number(value))
    : [];

  if (
    location.type !== "Point" ||
    !address ||
    coordinates.length !== 2 ||
    !Number.isFinite(coordinates[0]) ||
    !Number.isFinite(coordinates[1])
  ) {
    return null;
  }

  return {
    type: "Point",
    address,
    coordinates,
  };
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve(undefined);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        fileName: file.name || "upload",
        mimeType: file.type || "application/octet-stream",
        size: Number(file.size || 0),
        dataUrl: typeof reader.result === "string" ? reader.result : "",
      });
    };

    reader.onerror = () =>
      reject(reader.error || new Error("Không thể đọc tệp"));

    reader.readAsDataURL(file);
  });

const sanitizePayload = (values) => {
  const payload = {
    ...values,
    fullNameSnapshot:
      values.fullNameSnapshot?.trim().replace(/\s+/g, " ") || "",
    emailSnapshot: values.emailSnapshot?.trim().toLowerCase() || "",
    phoneSnapshot: values.phoneSnapshot?.trim().replace(/\s|[-.]/g, "") || "",
    locationSnapshot: normalizeLocation(values.locationSnapshot),
    organizationName:
      values.organizationName?.trim().replace(/\s+/g, " ") || "",
    organizationWebsite: values.organizationWebsite?.trim() || "",
    bankName: values.bankName?.trim() || "",
    bankBin: values.bankBin?.trim() || "",
    bankAccountNumber: values.bankAccountNumber?.trim() || "",
    bankAccountName:
      values.bankAccountName?.trim().replace(/\s+/g, " ") || "",
    notes: values.notes?.trim() || "",
    idCardFront: normalizeDocument(values.idCardFront),
    idCardBack: normalizeDocument(values.idCardBack),
    selfie: normalizeDocument(values.selfie),
    businessLicense: normalizeDocument(values.businessLicense),
    bankProof: normalizeDocument(values.bankProof),
  };

  if (!payload.businessLicense) delete payload.businessLicense;
  if (!payload.bankProof) delete payload.bankProof;

  return payload;
};

const getFirstErrorMessage = (errors) => {
  const visit = (value) => {
    if (!value || typeof value !== "object") return null;

    for (const key of Object.keys(value)) {
      const nestedValue = value[key];
      if (nestedValue?.message) return nestedValue.message;

      const nestedMessage = visit(nestedValue);
      if (nestedMessage) return nestedMessage;
    }

    return null;
  };

  return visit(errors);
};

export function useOrganizerRequestForm(existingRequest = null) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useAuthStore(authSelectors.user);

  const defaultValues = useMemo(
    () => ({
      fullNameSnapshot:
        existingRequest?.fullNameSnapshot || currentUser?.fullName || "",
      emailSnapshot: existingRequest?.emailSnapshot || currentUser?.email || "",
      phoneSnapshot: existingRequest?.phoneSnapshot || currentUser?.phone || "",
      locationSnapshot:
        normalizeLocation(existingRequest?.locationSnapshot) ||
        normalizeLocation(currentUser?.location) ||
        null,
      organizationName: existingRequest?.organizationName || "",
      organizationType: existingRequest?.organizationType || "COMMUNITY",
      organizationWebsite: existingRequest?.organizationWebsite || "",
      idCardFront: normalizeDocument(existingRequest?.idCardFront),
      idCardBack: normalizeDocument(existingRequest?.idCardBack),
      selfie: normalizeDocument(existingRequest?.selfie),
      businessLicense: normalizeDocument(existingRequest?.businessLicense),
      bankProof: normalizeDocument(existingRequest?.bankProof),
      bankName: existingRequest?.bankName || "",
      bankBin: existingRequest?.bankBin || "",
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

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const mutation = useMutation({
    mutationFn: organizerRequestAPI.submitRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.organizerRequests.me(),
      });

      toast.success("Đã gửi hồ sơ nhà tổ chức thành công");
      navigate("/organizer/request");
    },
    onError: async (error) => {
      if (error.response?.status === 409) {
        toast.info("Bạn đã có một hồ sơ đang chờ duyệt. Đang cập nhật lại trang...");

        await queryClient.invalidateQueries({
          queryKey: queryKeys.organizerRequests.me(),
        });

        navigate("/organizer/request");
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });

  const onDocumentChange = async (fieldName, file) => {
    if (!file) {
      form.setValue(fieldName, undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (typeof File !== "undefined" && file instanceof File) {
      try {
        const payload = await readFileAsDataUrl(file);

        form.setValue(fieldName, payload, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch {
        toast.error("Không thể đọc tệp. Vui lòng thử lại.");
      }

      return;
    }

    form.setValue(fieldName, file, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onValid = async (values) => {
    const payload = sanitizePayload(values);
    await mutation.mutateAsync(payload);
  };

  const onInvalid = (errors) => {
    const firstError = getFirstErrorMessage(errors);
    toast.error(firstError || "Vui lòng kiểm tra lại các trường đang được tô đỏ.");
  };

  return {
    form,
    onSubmit: form.handleSubmit(onValid, onInvalid),
    onDocumentChange,
    isSubmitting: mutation.isPending,
  };
}

export default useOrganizerRequestForm;