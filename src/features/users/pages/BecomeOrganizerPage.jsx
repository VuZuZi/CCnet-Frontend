import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useMyOrganizerRequest } from "../hooks/useMyOrganizerRequest";
import { useOrganizerRequestForm } from "../hooks/useOrganizerRequestForm";
import OrganizerRequestForm from "../components/organizerRequest/OrganizerRequestForm";
import OrganizerRequestStatusCard from "../components/organizerRequest/OrganizerRequestStatusCard";

export function BecomeOrganizerPage() {
  const currentUser = useAuthStore(authSelectors.user);
  const { request, isLoading } = useMyOrganizerRequest(true);

  const { form, onSubmit, onDocumentChange, isSubmitting } =
    useOrganizerRequestForm(request?.status === "DECLINED" ? request : null);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-6 pb-14 pt-10 md:px-8 md:pt-14">
        <div className="h-40 animate-pulse rounded-[24px] bg-slate-200" />
      </div>
    );
  }

  if (request?.status === "PENDING" || request?.status === "APPROVED") {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-6 pb-14 pt-10 md:px-8 md:pt-14">
        <OrganizerRequestStatusCard
          request={request}
          currentRole={currentUser?.role}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 pb-14 pt-10 md:px-8 md:pt-14">
      {request?.status === "DECLINED" ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Hồ sơ trước đó đã bị từ chối. Bạn có thể chỉnh sửa và gửi lại.
        </div>
      ) : null}

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