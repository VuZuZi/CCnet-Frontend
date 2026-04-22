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

    const donors = data?.pages.flatMap(page => page.donors) || [];
    const totalDonors = data?.pages[0]?.pagination?.totalItems || 0;
    const totalRaised = Number(
        project?.financialOverview?.totalRaised ??
        project?.financialDetail?.totalRaised ??
        project?.currentAmount ??
        0
    );

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-[24px] bg-emerald-50 border border-emerald-100 p-6">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <Users size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Tổng nhà hảo tâm</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {totalDonors.toLocaleString()} 
                        <span className="text-lg font-medium text-slate-500"> lượt</span>
                    </p>
                </div>

                <div className="rounded-[24px] bg-amber-50 border border-amber-100 p-6">
                    <div className="flex items-center gap-3 text-amber-600 mb-2">
                        <Heart size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Tiền thực nhận</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {totalRaised.toLocaleString()} 
                        <span className="text-lg font-medium text-slate-500"> đ</span>
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                    Bảng sao kê dòng tiền <ArrowRight size={18} className="text-slate-400" />
                </h3>

                {donors.length === 0 ? (
                    <div className="py-20 text-center">
                        <Users className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">
                            Chưa có dữ liệu đóng góp công khai cho dự án này.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 border border-slate-100 rounded-[32px] overflow-hidden bg-white">
                        {donors.map((tx) => {
                            const isReversed = tx.reconciled;

                            return (
                                <div
                                    key={tx._id}
                                    className={`flex items-center justify-between p-5 transition-colors ${
                                        isReversed
                                            ? 'bg-slate-50/50 opacity-70'
                                            : 'hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
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
                                                {tx.donorRef?.fullName || "Nhà hảo tâm"}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                                                <Calendar size={12} />
                                                {formatDistanceToNow(new Date(tx.createdAt), {
                                                    addSuffix: true,
                                                    locale: vi,
                                                })}
                                            </div>
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
                                            {tx.amount.toLocaleString()}đ
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
                    <div className="pt-4 flex justify-center">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
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
