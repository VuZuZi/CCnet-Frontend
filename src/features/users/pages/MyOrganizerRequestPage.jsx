import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useMyOrganizerRequest } from "../hooks/useMyOrganizerRequest";
import OrganizerRequestStatusCard from "../components/organizerRequest/OrganizerRequestStatusCard";

export function MyOrganizerRequestPage() {
  const currentUser = useAuthStore(authSelectors.user);
  const { request, isLoading, isFetching } = useMyOrganizerRequest(true);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 md:pt-14">
        <div className="h-40 animate-pulse rounded-[24px] bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 md:pt-14">
      {isFetching ? (
        <p className="mb-4 text-sm text-slate-400">
          Đang cập nhật trạng thái hồ sơ...
        </p>
      ) : null}

      <OrganizerRequestStatusCard
        request={request}
        currentRole={currentUser?.role}
      />
    </div>
  );
}

export default MyOrganizerRequestPage;