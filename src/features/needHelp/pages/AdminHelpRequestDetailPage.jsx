import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleAlert, Loader2 } from 'lucide-react';

import { HelpRequestDetailHero } from '../components/detail/HelpRequestDetailHero';
import { HelpRequestFundingCard } from '../components/detail/HelpRequestFundingCard';
import { HelpRequestStory } from '../components/detail/HelpRequestStory';
import { HelpRequestVerification } from '../components/detail/HelpRequestVerification';
import { AdminAssignmentPanel } from '../components/admin/AdminAssignmentPanel';
import { useHelpRequestDetail } from '../hooks/useHelpRequestQueries';

export function AdminHelpRequestDetailPage() {
  const { id } = useParams();
  const { data: helpRequest, isLoading, isError, error } = useHelpRequestDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-amber-500" size={32} />
          <p className="mt-4 text-sm text-slate-500">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (isError || !helpRequest) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <CircleAlert size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Help request not found</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {error?.message || 'The request does not exist or is no longer available.'}
        </p>
        <Link
          to="/admin/need-help"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-500"
        >
          <ArrowLeft size={16} />
          Back to Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Request Details</h1>
      </div>

      <AdminAssignmentPanel helpRequest={helpRequest} />

      <HelpRequestDetailHero helpRequest={helpRequest} />

      <HelpRequestFundingCard amountNeeded={helpRequest.amountNeeded} />

      <HelpRequestStory story={helpRequest.story} evidences={helpRequest.evidences} />

      <HelpRequestVerification helpRequest={helpRequest} />
    </div>
  );
}

export default AdminHelpRequestDetailPage;
