import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { organizerRequestAPI } from "../api/organizerRequestAPI";
import { queryKeys } from "@/shared/constants/queryKeys";
import OrganizerRequestForm from "../components/organizerRequest/OrganizerRequestForm";
import OrganizerRequestStatusCard from "../components/organizerRequest/OrganizerRequestStatusCard";
import MicroDepositVerification from "../components/organizerRequest/MicroDepositVerification";
import { useOrganizerRequestForm } from "../hooks/useOrganizerRequestForm";

export function BecomeOrganizerPage() {
  const currentUser = useAuthStore(authSelectors.user);
  
  const { data: request, isLoading } = useQuery({
    queryKey: queryKeys.organizerRequests.me(),
    queryFn: organizerRequestAPI.getMyLatestRequest,
  });

  const { form, onSubmit, onDocumentChange, isSubmitting } =
    useOrganizerRequestForm(request?.status === "DECLINED" ? request : null);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-6 pb-14 pt-10">
        <div className="h-96 animate-pulse rounded-[24px] bg-slate-200" />
      </div>
    );
  }

  if (request?.status === "AWAITING_MICRO_DEPOSIT") {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-6 pb-14 pt-10">
        <MicroDepositVerification request={request} />
      </div>
    );
  }

  if (request?.status === "PENDING" || request?.status === "APPROVED" || request?.status === "SYSTEM_CHECKING") {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-6 pb-14 pt-10">
        <OrganizerRequestStatusCard request={request} currentRole={currentUser?.role} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 pb-14 pt-10">
      {request?.status === "DECLINED" && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <strong className="block mb-1">Hồ sơ trước đó bị từ chối với lý do:</strong>
          {request.reviewReason || "Vui lòng kiểm tra và gửi lại giấy tờ hợp lệ."}
        </div>
      )}

      <OrganizerRequestForm
        form={form}
        onSubmit={onSubmit}
        onDocumentChange={onDocumentChange}
        isSubmitting={isSubmitting}
        isResubmitting={request?.status === "DECLINED"}
      />
    </div>
  );
}

export default BecomeOrganizerPage;