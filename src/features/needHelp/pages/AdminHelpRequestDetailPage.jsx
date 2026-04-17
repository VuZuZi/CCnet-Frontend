import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';

import { HelpRequestDetailHero } from '../components/detail/HelpRequestDetailHero';
import { HelpRequestFundingCard } from '../components/detail/HelpRequestFundingCard';
import { HelpRequestStory } from '../components/detail/HelpRequestStory';
import { HelpRequestVerification } from '../components/detail/HelpRequestVerification';
import { AdminAssignmentPanel } from '../components/admin/AdminAssignmentPanel';
import { useHelpRequestDetail } from '../hooks/useHelpRequestQueries';
import { useVerifyHelpRequest } from '../hooks/useHelpRequestMutations';

function AdminDetailHeader({ title }) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_55px_-36px_rgba(15,23,42,0.2)]">
      <div className="px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <Link
              to="/admin/need-help"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft size={14} />
              Quay lại yêu cầu
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
              <ShieldCheck size={14} />
              Kiểm duyệt chi tiết của Admin
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Chi tiết yêu cầu
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Kiểm duyệt bối cảnh yêu cầu, kiểm tra sẵn sàng hỗ trợ và tiến hành điều chỉnh 
              từ một không gian làm việc admin rõ ràng hơn.
            </p>
          </div>

          <div className="max-w-md rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
              <Sparkles size={13} />
              Yêu cầu hiện tại
            </div>
            <p className="mt-2 break-words text-base font-semibold text-slate-900">
              {title || 'Yêu cầu không có tiêu đề'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function getModerationStatusMessage(status) {
  switch (status) {
    case 'PENDING':
      return 'Yêu cầu này đang chờ xác minh từ quản trị viên.';
    case 'VERIFIED':
      return 'Yêu cầu này đã được xác minh và có thể được gán cho người tổ chức.';
    case 'IN_PROGRESS':
      return 'Yêu cầu này hiện đang được xử lý bởi một người tổ chức.';
    case 'COMPLETED':
      return 'Yêu cầu này đã hoàn thành.';
    case 'REJECTED':
      return 'Yêu cầu này đã bị từ chối và có thể được chỉnh sửa bởi người yêu cầu để gửi lại.';
    case 'CANCELLED':
      return 'Yêu cầu này đã bị hủy bỏ bởi người yêu cầu.';
    default:
      return 'Yêu cầu này ở trong trạng thái vòng đời được quản lý.';
  }
}

function AdminModerationPanel({ helpRequest }) {
  const verifyMutation = useVerifyHelpRequest();
  const [rejectionReason, setRejectionReason] = useState('');

  const isPendingReview = helpRequest?.status === 'PENDING';
  const canReject = rejectionReason.trim().length > 0;

  const handleApprove = async () => {
    await verifyMutation.mutateAsync({
      id: helpRequest._id,
      approved: true,
    });
  };

  const handleReject = async () => {
    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) return;

    await verifyMutation.mutateAsync({
      id: helpRequest._id,
      approved: false,
      rejectionReason: trimmedReason,
    });

    setRejectionReason('');
  };

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
            <ShieldCheck size={13} />
            Kiểm duyệt
          </div>

          <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            Quyết định xác minh
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {getModerationStatusMessage(helpRequest?.status)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Trạng thái hiện tại
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {helpRequest?.status || 'Không xác định'}
          </p>
        </div>
      </div>

      {isPendingReview ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="block text-sm font-bold text-slate-700">
              Lý do từ chối
            </label>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Viết ra lý do rõ ràng nếu bạn muốn từ chối yêu cầu này..."
              className="mt-3 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <div className="flex flex-col gap-3 xl:w-[220px]">
            <button
              type="button"
              onClick={handleApprove}
              disabled={verifyMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifyMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Phê duyệt
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={verifyMutation.isPending || !canReject}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifyMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Từ chối
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm text-slate-500">
          Các hành động kiểm duyệt chỉ khả dụng khi yêu cầu ở trong trạng thái{' '}
          <span className="font-semibold text-slate-700">PENDING</span>.
        </div>
      )}
    </section>
  );
}

export function AdminHelpRequestDetailPage() {
  const { id } = useParams();
  const { data: helpRequest, isLoading, isError, error } = useHelpRequestDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-[30px] border border-slate-200 bg-white py-24 shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-amber-500" size={36} />
          <p className="mt-4 text-sm font-medium text-slate-500">Đang tải chi tiết yêu cầu...</p>
        </div>
      </div>
    );
  }

  if (isError || !helpRequest) {
    return (
      <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <CircleAlert size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy yêu cầu trợ giúp</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {error?.message || 'Yêu cầu không tồn tại hoặc không còn khả dụng.'}
        </p>
        <Link
          to="/admin/need-help"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
        >
          <ArrowLeft size={16} />
          Quay lại yêu cầu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader title={helpRequest.title} />
      <AdminModerationPanel helpRequest={helpRequest} />
      <AdminAssignmentPanel helpRequest={helpRequest} />
      <HelpRequestDetailHero helpRequest={helpRequest} />
      <HelpRequestFundingCard amountNeeded={helpRequest.amountNeeded} />
      <HelpRequestStory story={helpRequest.story} evidences={helpRequest.evidences} />
      <HelpRequestVerification helpRequest={helpRequest} />
    </div>
  );
}

export default AdminHelpRequestDetailPage;