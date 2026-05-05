import { useInfiniteProjectDonors } from '@/features/transaction/hooks/useProjectDonors';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heart, Users, Calendar, ArrowRight, Loader2, UserCircle2 } from 'lucide-react';

export function ProjectFinancialsTab({ project }) {
    const projectId = project?._id || project?.id;
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteProjectDonors(projectId);

    const donors = data?.pages.flatMap((page) => page.donors) || [];
    const totalDonors = data?.pages[0]?.pagination?.totalItems || 0;
    const totalRaised = Number(
        project?.financialOverview?.totalRaised ??
        project?.financialDetail?.totalRaised ??
        project?.currentAmount ??
        0
    );

    const getDonationMessage = (tx) => {
        const rawMessage = typeof tx?.message === 'string' ? tx.message.trim() : '';
        return rawMessage || '';
    };

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-slate-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-6">
                    <div className="mb-2 flex items-center gap-3 text-emerald-600">
                        <Users size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">
                            Tổng nhà hảo tâm
                        </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {totalDonors.toLocaleString()}
                        <span className="text-lg font-medium text-slate-500">
                            lượt
                        </span>
                    </p>
                </div>

                <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-6">
                    <div className="mb-2 flex items-center gap-3 text-amber-600">
                        <Heart size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">
                            Tiền thực nhận
                        </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {totalRaised.toLocaleString()}
                        <span className="text-lg font-medium text-slate-500">
                            đ
                        </span>
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="flex items-center gap-2 px-2 text-lg font-bold text-slate-900">
                    Bảng sao kê dòng tiền <ArrowRight size={18} className="text-slate-400" />
                </h3>

                {donors.length === 0 ? (
                    <div className="py-20 text-center">
                        <Users className="mx-auto mb-4 text-slate-200" size={48} />
                        <p className="font-medium text-slate-500">
                            Chưa có dữ liệu đóng góp công khai cho dự án này.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 overflow-hidden rounded-[32px] border border-slate-100 bg-white">
                        {donors.map((tx) => {
                            const isReversed = tx.reconciled;
                            const donationMessage = getDonationMessage(tx);

                            return (
                                <div
                                    key={tx._id}
                                    className={`flex items-start justify-between gap-4 p-5 transition-colors ${
                                        isReversed
                                            ? 'bg-slate-50/50 opacity-70'
                                            : 'hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50">
                                            {tx.donorRef?.avatar ? (
                                                <img
                                                    src={tx.donorRef.avatar}
                                                    alt="avatar"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserCircle2 className="text-slate-300" size={32} />
                                            )}
                                        </div>

                                        <div>
                                            <p
                                                className={`font-bold ${
                                                    isReversed
                                                        ? 'text-slate-400 line-through'
                                                        : 'text-slate-900'
                                                }`}
                                            >
                                                {tx.donorRef?.fullName || 'Nhà hảo tâm'}
                                            </p>

                                            <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-slate-400">
                                                <Calendar size={12} />
                                                {formatDistanceToNow(new Date(tx.createdAt), {
                                                    addSuffix: true,
                                                    locale: vi,
                                                })}
                                            </div>

                                            {donationMessage ? (
                                                <p className="mt-2 max-w-2xl whitespace-pre-wrap break-words rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                                                    {'"'}{donationMessage}{'"'}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={`text-lg font-black ${
                                                isReversed
                                                    ? 'text-rose-400 line-through'
                                                    : 'text-emerald-600'
                                            }`}
                                        >
                                            {isReversed ? '-' : '+'}
                                            {tx.amount.toLocaleString()}
                                            đ
                                        </p>

                                        <p
                                            className={`text-[10px] font-bold uppercase tracking-tighter ${
                                                isReversed
                                                    ? 'text-rose-500'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {isReversed ? 'Hoàn tiền' : 'Thành công'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasNextPage && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang tải thêm...
                                </>
                            ) : (
                                'Xem thêm nhà hảo tâm'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
