import { useParams } from "react-router-dom";
import { AlertTriangle, Info } from "lucide-react";
import OrganizerRequestStatusBadge from "../components/organizerRequest/OrganizerRequestStatusBadge";
import OrganizerDocumentList from "../components/organizerRequest/OrganizerDocumentList";
import OrganizerReviewActions from "../components/organizerRequest/OrganizerReviewActions";
import { useOrganizerRequestDetail } from "../hooks/useOrganizerRequestDetail";

const formatDate = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
};

function InfoBox({ label, children }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
      {children}
    </div>
  );
}

export function OrganizerRequestDetailPage() {
  const { id } = useParams();
  const { request, isLoading, approve, decline, isApproving, isDeclining } = useOrganizerRequestDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-r-transparent" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-10 text-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-slate-500">Organizer request not found.</p>
      </div>
    );
  }

  const hasRiskFlag = request.riskFlags?.includes("CROSS_LINKED_BANK") || request.notes?.includes("[SYSTEM FLAG]");
  const currentName = request.userId?.fullName;
  const isNameChanged = currentName && currentName !== request.fullNameSnapshot;

  return (
    <div className="flex flex-col xl:flex-row items-start gap-6 relative">

      <div className="w-full xl:w-3/5 flex flex-col gap-6">

        {hasRiskFlag && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500 bg-rose-50 p-5 shadow-sm">
            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-rose-800 text-lg">⚠️ RISK WARNING (AML FLAG)</h3>
              <p className="mt-1 text-sm text-rose-700">
                {request.notes?.includes("[SYSTEM FLAG]")
                  ? request.notes
                  : "The system detected that this Bank Account Number duplicates another user's. Please cross-check documents carefully."}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Organizer Request Details</h1>
            <p className="mt-1 text-sm text-slate-500">ID: {request._id}</p>
          </div>
          <OrganizerRequestStatusBadge status={request.status} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-lg font-bold text-slate-900">1. Identification Information (Snapshot)</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBox label="Applicant">
              <p className="text-sm font-semibold text-slate-900">{request.fullNameSnapshot}</p>
              {isNameChanged && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                  <Info size={14} /> Currently user has changed name to: {currentName}
                </div>
              )}
            </InfoBox>
            <InfoBox label="Contact">
              <p className="text-sm font-semibold text-slate-900">{request.emailSnapshot}</p>
              <p className="text-sm text-slate-600">{request.phoneSnapshot || "Phone not provided"}</p>
            </InfoBox>
          </div>

          <div className="mt-6 mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-lg font-bold text-slate-900">2. Organization Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBox label="Organization Name">
              <p className="text-sm font-semibold text-slate-900">{request.organizationName}</p>
            </InfoBox>
            <InfoBox label="Type & Website">
              <p className="text-sm font-semibold text-slate-900">{request.organizationType}</p>
              <p className="text-sm text-blue-600 truncate">{request.organizationWebsite || "None"}</p>
            </InfoBox>
          </div>

          <div className="mt-6 mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-lg font-bold text-slate-900">3. Bank Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBox label="Receiving Account">
              <p className="text-sm font-semibold text-slate-900">{request.bankAccountNumber}</p>
              <p className="text-sm text-slate-600">{request.bankName}</p>
            </InfoBox>
            <InfoBox label="Account Holder">
              <p className="text-sm font-semibold text-slate-900">{request.bankAccountName}</p>
            </InfoBox>
          </div>

          {request.resubmissionCount > 0 && (
            <div className="mt-6 rounded-xl bg-slate-800 p-4 text-white">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Info size={16} className="text-sky-400" />
                This request is submission attempt #{request.resubmissionCount + 1}
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-4 z-20">
          <OrganizerReviewActions
            status={request.status}
            onApprove={approve}
            onDecline={(reason) => decline({ reviewReason: reason })}
            isApproving={isApproving}
            isDeclining={isDeclining}
          />
        </div>
      </div>

      <div className="w-full xl:w-2/5 flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Attached Documents</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Careful review required
            </span>
          </div>
          <OrganizerDocumentList request={request} />
        </div>
      </div>

    </div>
  );
}

export default OrganizerRequestDetailPage;