import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleAlert, Loader2, Pencil, Trash2 } from 'lucide-react';

import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

import { HelpRequestDetailHero } from '../components/detail/HelpRequestDetailHero';
import { HelpRequestFundingCard } from '../components/detail/HelpRequestFundingCard';
import { HelpRequestStory } from '../components/detail/HelpRequestStory';
import { HelpRequestVerification } from '../components/detail/HelpRequestVerification';
import { useHelpRequestDetail } from '../hooks/useHelpRequestQueries';
import { useDeleteHelpRequest } from '../hooks/useHelpRequestMutations';

export function HelpRequestDetailPage() {
  const { id } = useParams();
  const currentUserId = useAuthStore(authSelectors.userId);
  const deleteMutation = useDeleteHelpRequest();
  const { data: helpRequest, isLoading, isError, error } = useHelpRequestDetail(id);

  const requesterId =
    typeof helpRequest?.requesterId === 'object'
      ? (helpRequest.requesterId?._id || helpRequest.requesterId?.id)
      : helpRequest?.requesterId;

  const isOwner = Boolean(
    currentUserId && requesterId && currentUserId.toString() === requesterId.toString()
  );

  const handleDelete = () => {
    if (!helpRequest?._id) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this help request? This action cannot be undone.'
    );

    if (confirmed) {
      deleteMutation.mutate(helpRequest._id);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      </main>
    );
  }

  if (isError || !helpRequest) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <CircleAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Help request not found</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            {error?.message || 'The request you are looking for does not exist or is no longer available.'}
          </p>
          <Link
            to={ROUTES.NEED_HELP}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
          >
            <ArrowLeft size={18} />
            Back to Help Requests
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <Link
        to={ROUTES.NEED_HELP}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to Help Requests
      </Link>

      {isOwner && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            to={`/need-help/${helpRequest._id}/edit`}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit Request
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 size={16} />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Request'}
          </button>
        </div>
      )}

      <div className="space-y-6">
        <HelpRequestDetailHero helpRequest={helpRequest} />
        <HelpRequestFundingCard amountNeeded={helpRequest.amountNeeded} />
        <HelpRequestStory story={helpRequest.story} evidences={helpRequest.evidences} />
        <HelpRequestVerification helpRequest={helpRequest} />
      </div>
    </main>
  );
}

export default HelpRequestDetailPage;
