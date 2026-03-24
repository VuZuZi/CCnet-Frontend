import { useParams } from "react-router-dom";
import OrganizerRequestStatusBadge from "../components/organizerRequest/OrganizerRequestStatusBadge";
import OrganizerDocumentList from "../components/organizerRequest/OrganizerDocumentList";
import OrganizerReviewActions from "../components/organizerRequest/OrganizerReviewActions";
import { useOrganizerRequestDetail } from "../hooks/useOrganizerRequestDetail";

const formatDate = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export function OrganizerRequestDetailPage() {
  const { id } = useParams();
  const { request, isLoading, approve, decline, isApproving, isDeclining } =
    useOrganizerRequestDetail(id);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-r-transparent" />
        <p className="mt-4 text-sm text-slate-500">
          Đang tải chi tiết hồ sơ...
        </p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">Không tìm thấy hồ sơ Organizer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Organizer Verification
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review the submitted information and documents carefully.
            </p>
          </div>

          <OrganizerRequestStatusBadge status={request.status} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Profile Summary</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Applicant
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {request.fullNameSnapshot}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {request.emailSnapshot}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Phone
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {request.phoneSnapshot || "--"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Location
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {request.locationSnapshot || "--"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Submitted At
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(request.submittedAt || request.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Organization Name
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {request.organizationName}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Organization Type
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {request.organizationType}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Website
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-900">
              {request.organizationWebsite || "--"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Bank Info
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {request.bankName} - {request.bankAccountNumber}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {request.bankAccountName}
            </p>
          </div>
        </div>

        {request.notes ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Notes
            </p>
            <p className="mt-2 text-sm text-slate-700">{request.notes}</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Submitted Documents</h2>
        <div className="mt-5">
          <OrganizerDocumentList request={request} />
        </div>
      </div>

      {request.reviewReason ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <span className="font-bold">Review Reason:</span>{" "}
          {request.reviewReason}
        </div>
      ) : null}

      <OrganizerReviewActions
        status={request.status}
        onApprove={approve}
        onDecline={(reason) => decline({ reviewReason: reason })}
        isApproving={isApproving}
        isDeclining={isDeclining}
      />
    </div>
  );
}

export default OrganizerRequestDetailPage;