import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CircleAlert,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { HelpRequestDetailHero } from '../components/detail/HelpRequestDetailHero';
import { HelpRequestFundingCard } from '../components/detail/HelpRequestFundingCard';
import { HelpRequestStory } from '../components/detail/HelpRequestStory';
import { HelpRequestVerification } from '../components/detail/HelpRequestVerification';
import { AdminAssignmentPanel } from '../components/admin/AdminAssignmentPanel';
import { useHelpRequestDetail } from '../hooks/useHelpRequestQueries';

function AdminDetailHeader({ title }) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_55px_-36px_rgba(15,23,42,0.2)]">
      <div className="px-6 py-7 sm:px-8">
        <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 max-w-3xl">
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

            <h1 className="mt-4 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Chi tiết yêu cầu
            </h1>

            <p className="mt-3 max-w-2xl break-words text-sm leading-7 text-slate-500 sm:text-base">
              Theo dõi đầy đủ nội dung yêu cầu, thông tin hỗ trợ và gán organizer phù hợp
              trong không gian quản trị rõ ràng hơn.
            </p>
          </div>

          <div className="min-w-0 max-w-md rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm xl:w-full xl:max-w-md">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
              <Sparkles size={13} />
              Yêu cầu hiện tại
            </div>
            <p
              className="mt-2 min-w-0 break-all text-base font-semibold text-slate-900"
              style={{ overflowWrap: 'anywhere' }}
            >
              {title || 'Yêu cầu không có tiêu đề'}
            </p>
          </div>
        </div>
      </div>
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
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <AdminDetailHeader title={helpRequest.title} />
      <AdminAssignmentPanel helpRequest={helpRequest} />
      <HelpRequestDetailHero helpRequest={helpRequest} />
      <HelpRequestFundingCard amountNeeded={helpRequest.amountNeeded} />
      <HelpRequestStory story={helpRequest.story} evidences={helpRequest.evidences} />
      <HelpRequestVerification helpRequest={helpRequest} />
    </div>
  );
}

export default AdminHelpRequestDetailPage;