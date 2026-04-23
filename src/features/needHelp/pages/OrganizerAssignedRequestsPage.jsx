import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  ExternalLink,
  FileSearch,
  Loader2,
  MapPin,
  Sparkles,
  X as XIcon,
} from 'lucide-react';

import { formatVND, formatDate } from '@/shared/lib/formatters';
import { ROUTES } from '@/shared/constants/routes';
import { useOrganizerAssignedRequests } from '../hooks/useHelpRequestQueries';
import { useRespondHelpRequestAssignment } from '../hooks/useHelpRequestMutations';

const URGENCY_STYLES = {
  CRITICAL: 'border-rose-200 bg-rose-50 text-rose-700',
  HIGH: 'border-orange-200 bg-orange-50 text-orange-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const CATEGORY_LABELS = {
  Y_TE: 'Hỗ trợ y tế',
  GIAO_DUC: 'Giáo dục',
  THIEN_TAI: 'Cứu trợ thảm họa',
  XAY_DUNG: 'Xây dựng',
  MOI_TRUONG: 'Môi trường',
  KHAC: 'Khác',
};

const TAB_OPTIONS = [
  {
    key: 'pending',
    label: 'Đang chờ xử lý',
    emptyText: 'Hiện tại không có giao việc nào đang chờ xử lý.',
    helper: 'Các yêu cầu đang chờ xác nhận của bạn.',
  },
  {
    key: 'accepted',
    label: 'Đã chấp nhận',
    emptyText: 'Bạn chưa chấp nhận bất kỳ giao việc nào.',
    helper: 'Các yêu cầu đang xử lý của bạn.',
  },
];

function RejectConfirmModal({ isOpen, requestTitle, onConfirm, onCancel, isPending }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.3)]">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <XIcon size={22} />
        </div>

        <h3 className="text-xl font-black tracking-tight text-slate-900">
          Từ chối giao việc
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Bạn có chắc chắn muốn từ chối giao việc cho{' '}
          <span className="font-semibold text-slate-800">"{requestTitle}"</span>? Yêu cầu này 
          sẽ được trả lại cho quản trị viên để gán lại.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <XIcon size={14} />}
            {isPending ? 'Đang từ chối...' : 'Từ chối giao việc'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, active = false }) {
  return (
    <div
      className={`rounded-[22px] border px-4 py-4 shadow-sm transition-all ${
        active
          ? 'border-amber-200 bg-amber-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function AssignedRequestCard({ request, onAccept, onReject, isResponding, activeTab }) {
  const urgencyStyle = URGENCY_STYLES[request.urgencyLevel] || URGENCY_STYLES.MEDIUM;
  const categoryLabel = CATEGORY_LABELS[request.category] || 'Khác';
  const coverImage = request.evidences?.find(
    (item) => item?.mediaType === 'image' || !item?.mediaType
  )?.url;

  const isPending = activeTab === 'pending';
  const isAccepted = request.status === 'IN_PROGRESS';

  const handleAccept = async () => {
    await onAccept(request._id);
  };

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.28)]">
      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative h-52 overflow-hidden bg-slate-100 lg:h-full">
          {coverImage ? (
            <img
              src={coverImage}
              alt={request.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-slate-100 to-sky-50 text-sm font-bold text-slate-400">
              Không có ảnh bìa
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${urgencyStyle}`}
            >
              {request.urgencyLevel || 'MEDIUM'}
            </span>

            <span className="inline-flex items-center rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 backdrop-blur">
              {categoryLabel}
            </span>
          </div>

          {isAccepted ? (
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                Đang xử lý
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to={`/need-help/${request._id}`}
                  className="block text-2xl font-black tracking-tight text-slate-950 transition-colors hover:text-amber-600"
                >
                  <span className="line-clamp-2 break-words">{request.title}</span>
                </Link>

                <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-500">
                  {request.story || 'Yêu cầu này chưa có câu chuyện mô tả.'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <MapPin size={13} />
                  Địa điểm
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-700">
                  {request.location?.address || 'Không có địa điểm'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <CircleDollarSign size={13} />
                  Kinh phí
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-700">
                  {request.amountNeeded ? formatVND(request.amountNeeded) : 'Linh hoạt'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <CalendarDays size={13} />
                  Ngày gửi
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {formatDate(request.createdAt) || 'Gần đây'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
              {isPending ? (
                <>
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={isResponding}
                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResponding ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} strokeWidth={3} />
                    )}
                    Chấp nhận yêu cầu
                  </button>

                  <button
                    type="button"
                    onClick={() => onReject(request._id, request.title)}
                    disabled={isResponding}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XIcon size={16} strokeWidth={3} />
                    Decline
                  </button>
                </>
              ) : null}

              {isAccepted && !request.linkedProjectId ? (
                <Link
                  to={`/projects/create?helpRequestId=${request._id}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  <ExternalLink size={16} strokeWidth={3} />
                  Tạo dự án
                </Link>
              ) : null}

              {isAccepted && request.linkedProjectId ? (
                <Link
                  to={`/projects/${
                    typeof request.linkedProjectId === 'object'
                      ? request.linkedProjectId._id
                      : request.linkedProjectId
                  }`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  <ExternalLink size={16} strokeWidth={3} />
                  Xem dự án
                </Link>
              ) : null}

              <Link
                to={`/need-help/${request._id}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function OrganizerAssignedRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    requestId: null,
    requestTitle: '',
  });

  const { data, isLoading } = useOrganizerAssignedRequests({
    limit: 50,
    sortBy: 'assignedAt',
  });
  const respondMutation = useRespondHelpRequestAssignment();

  const allItems = data?.data || [];

  const pendingItems = useMemo(
    () => allItems.filter((request) => request.status === 'VERIFIED'),
    [allItems]
  );

  const acceptedItems = useMemo(
    () => allItems.filter((request) => request.status === 'IN_PROGRESS'),
    [allItems]
  );

  const displayItems = activeTab === 'pending' ? pendingItems : acceptedItems;
  const currentTabConfig = TAB_OPTIONS.find((tab) => tab.key === activeTab);

  const handleAccept = async (id) => {
    await respondMutation.mutateAsync({ id, action: 'accept' });
    navigate(`${ROUTES.PROJECT_CREATE}?helpRequestId=${id}`);
  };

  const handleRejectClick = (requestId, requestTitle) => {
    setRejectModal({ isOpen: true, requestId, requestTitle });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.requestId) return;

    await respondMutation.mutateAsync({
      id: rejectModal.requestId,
      action: 'reject',
    });

    setRejectModal({ isOpen: false, requestId: null, requestTitle: '' });
  };

  const handleRejectCancel = () => {
    setRejectModal({ isOpen: false, requestId: null, requestTitle: '' });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_55px_-36px_rgba(15,23,42,0.2)]">
        <div className="px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                <Sparkles size={14} />
                Trung tâm giao việc cho nhà tổ chức
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Các yêu cầu trợ giúp đã giao
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Kiểm duyệt các yêu cầu được admin giao, xác nhận những yêu cầu bạn có thể xử lý, và tiếp tục dòng công việc hỗ trợ với không gian làm việc sạch hơn.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <SummaryCard label="Pending" value={pendingItems.length} active={activeTab === 'pending'} />
              <SummaryCard label="Accepted" value={acceptedItems.length} active={activeTab === 'accepted'} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Hàng chờ giao việc
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {currentTabConfig?.helper}
            </p>
          </div>

          <div className="w-full max-w-xl">
            <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-slate-100 p-1.5">
              {TAB_OPTIONS.map((tab) => {
                const count = tab.key === 'pending' ? pendingItems.length : acceptedItems.length;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
  isActive
    ? 'bg-amber-400 text-slate-950 shadow-sm'
    : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
}`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
  isActive
    ? 'bg-white/80 text-slate-950'
    : 'bg-slate-200 text-slate-500'
}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-24 shadow-sm">
            <Loader2 className="animate-spin text-amber-500" size={34} />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileSearch size={28} />
            </div>

            <p className="text-base font-semibold text-slate-700">
              {currentTabConfig?.emptyText}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Các mục bạn tham gia sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
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
      </section>

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
