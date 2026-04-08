import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  ExternalLink,
  FileSearch,
  Loader2,
  MapPin,
  X as XIcon,
} from 'lucide-react';

import { formatVND, formatDate } from '@/shared/lib/formatters';
import { useOrganizerAssignedRequests } from '../hooks/useHelpRequestQueries';
import { useRespondHelpRequestAssignment } from '../hooks/useHelpRequestMutations';

const URGENCY_STYLES = {
  CRITICAL: 'bg-rose-100 text-rose-700 border-rose-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const CATEGORY_LABELS = {
  Y_TE: 'Medical Aid',
  GIAO_DUC: 'Education',
  THIEN_TAI: 'Disaster Relief',
  XAY_DUNG: 'Construction',
  MOI_TRUONG: 'Environment',
  KHAC: 'Other',
};

const TAB_OPTIONS = [
  { key: 'pending', label: 'Pending Action', emptyText: 'No pending assignments right now.' },
  { key: 'accepted', label: 'Accepted', emptyText: 'You have not accepted any assignments yet.' },
];

function RejectConfirmModal({ isOpen, requestTitle, onConfirm, onCancel, isPending }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Decline Assignment</h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to decline the assignment for <strong>"{requestTitle}"</strong>?
          The request will be returned to admin for reassignment.
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <XIcon size={14} />}
            {isPending ? 'Declining...' : 'Decline Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignedRequestCard({ request, onAccept, onReject, isResponding, activeTab }) {
  const navigate = useNavigate();
  const urgencyStyle = URGENCY_STYLES[request.urgencyLevel] || URGENCY_STYLES.MEDIUM;
  const categoryLabel = CATEGORY_LABELS[request.category] || 'Other';
  const coverImage = request.evidences?.[0]?.url;
  const isPending = activeTab === 'pending';
  const isAccepted = request.status === 'IN_PROGRESS';

  const handleAccept = async () => {
    await onAccept(request._id);
    navigate(`/projects/create?helpRequestId=${request._id}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col sm:flex-row">
        {/* Cover thumbnail */}
        <div className="relative h-44 w-full flex-shrink-0 bg-slate-100 sm:h-auto sm:w-52">
          {coverImage ? (
            <img src={coverImage} alt={request.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-400">
              No Image
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2 sm:flex-col">
            <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${urgencyStyle}`}>
              {request.urgencyLevel}
            </span>
            <span className="inline-flex items-center rounded-lg border border-white/50 bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-700 backdrop-blur-sm">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                to={`/need-help/${request._id}`}
                className="text-xl font-extrabold tracking-tight text-slate-900 transition-colors hover:text-amber-500"
              >
                {request.title}
              </Link>
            </div>
            {isAccepted && (
              <span className="flex-shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                In Progress
              </span>
            )}
          </div>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {request.story}
          </p>

          {/* Info row */}
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-500 min-[400px]:grid-cols-2 md:flex md:items-center md:gap-5">
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin size={14} className="text-slate-400" />
              {request.location?.address || 'No location'}
            </span>
            <span className="inline-flex items-center gap-1.5 flex-shrink-0">
              <CircleDollarSign size={14} className="text-slate-400" />
              <span className="font-semibold text-slate-700">{request.amountNeeded ? formatVND(request.amountNeeded) : 'Flexible'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 flex-shrink-0">
              <CalendarDays size={14} className="text-slate-400" />
              {formatDate(request.createdAt) || 'Recently'}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-slate-50 pt-5">
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isResponding}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95 disabled:opacity-60"
                >
                  <Check size={16} strokeWidth={3} />
                  Accept & Host
                </button>
                <button
                  type="button"
                  onClick={() => onReject(request._id, request.title)}
                  disabled={isResponding}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-rose-600 active:scale-95 disabled:opacity-60"
                >
                  <XIcon size={16} strokeWidth={3} />
                  Decline
                </button>
              </>
            )}

            {isAccepted && !request.linkedProjectId && (
              <Link
                to={`/projects/create?helpRequestId=${request._id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-black uppercase tracking-tight text-slate-900 shadow-lg shadow-amber-200 transition-all hover:bg-amber-500 hover:shadow-xl active:scale-95"
              >
                <ExternalLink size={16} strokeWidth={3} />
                Create Project
              </Link>
            )}

            {isAccepted && request.linkedProjectId && (
              <Link
                to={`/projects/${typeof request.linkedProjectId === 'object' ? request.linkedProjectId._id : request.linkedProjectId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-black uppercase tracking-tight text-slate-900 shadow-lg shadow-amber-200 transition-all hover:bg-amber-500 hover:shadow-xl active:scale-95"
              >
                <ExternalLink size={16} strokeWidth={3} />
                View Project
              </Link>
            )}

            <Link
              to={`/need-help/${request._id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrganizerAssignedRequestsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectModal, setRejectModal] = useState({ isOpen: false, requestId: null, requestTitle: '' });

  const { data, isLoading } = useOrganizerAssignedRequests({ limit: 50, sortBy: 'assignedAt' });
  const respondMutation = useRespondHelpRequestAssignment();

  const allItems = data?.data || [];

  // Split into pending (VERIFIED = waiting for organizer response) and accepted (IN_PROGRESS)
  const pendingItems = allItems.filter((r) => r.status === 'VERIFIED');
  const acceptedItems = allItems.filter((r) => r.status === 'IN_PROGRESS');

  const displayItems = activeTab === 'pending' ? pendingItems : acceptedItems;
  const currentTabConfig = TAB_OPTIONS.find((t) => t.key === activeTab);

  const handleAccept = async (id) => {
    await respondMutation.mutateAsync({ id, action: 'accept' });
  };

  const handleRejectClick = (requestId, requestTitle) => {
    setRejectModal({ isOpen: true, requestId, requestTitle });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.requestId) return;
    await respondMutation.mutateAsync({ id: rejectModal.requestId, action: 'reject' });
    setRejectModal({ isOpen: false, requestId: null, requestTitle: '' });
  };

  const handleRejectCancel = () => {
    setRejectModal({ isOpen: false, requestId: null, requestTitle: '' });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Assigned NeedHelp Requests
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
          Review assignments from admin. Accept to start a project or decline to return.
        </p>
      </div>

      {/* Tabs - Fixed width and centered */}
      <div className="mx-auto mb-10 min-w-0 max-w-xl">
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1.5 shadow-sm">
          {TAB_OPTIONS.map((tab) => {
            const count = tab.key === 'pending' ? pendingItems.length : acceptedItems.length;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      ) : displayItems.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <FileSearch size={32} />
          </div>
          <p className="text-base font-semibold text-slate-600">{currentTabConfig?.emptyText}</p>
          <p className="mt-1 text-sm text-slate-400">Items you participate in will appear here.</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 duration-500">
          {displayItems.map((request) => (
            <AssignedRequestCard
              key={request._id}
              request={request}
              onAccept={handleAccept}
              onReject={handleRejectClick}
              isResponding={respondMutation.isPending}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}

      <RejectConfirmModal
        isOpen={rejectModal.isOpen}
        requestTitle={rejectModal.requestTitle}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
        isPending={respondMutation.isPending}
      />
    </main>
  );
}

export default OrganizerAssignedRequestsPage;
