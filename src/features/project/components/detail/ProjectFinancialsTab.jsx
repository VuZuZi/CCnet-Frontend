import { useInfiniteProjectDonors } from '@/features/transaction/hooks/useProjectDonors';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Heart,
    Users,
    Calendar,
    ArrowRight,
    Loader2,
    UserCircle2,
    MessageCircle
} from 'lucide-react';

export function ProjectFinancialsTab({ project }) {
    const projectId = project?._id || project?.id;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteProjectDonors(projectId);

    const donations = data?.pages.flatMap(page => page.donors) || [];
    const totalDonations = data?.pages[0]?.pagination?.totalItems || 0;

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 w-full animate-pulse rounded-[24px] bg-slate-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-[24px] bg-emerald-50 border border-emerald-100 p-6 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <Users size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Lượt quyên góp</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {totalDonations.toLocaleString()}
                        <span className="text-lg font-medium text-slate-500 ml-2">lượt</span>
                    </p>
                </div>

                <div className="rounded-[24px] bg-amber-50 border border-amber-100 p-6 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-3 text-amber-600 mb-2">
                        <Heart size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Tiền thực nhận (Net)</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {(project?.financialDetail?.availableBalance || 0).toLocaleString()}
                        <span className="text-lg font-medium text-slate-500 ml-2">đ</span>
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                    Bảng sao kê dòng tiền <ArrowRight size={18} className="text-slate-400" />
                </h3>

                {donations.length === 0 ? (
                    <div className="py-20 text-center rounded-[32px] border border-dashed border-slate-200">
                        <Users className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">Chưa có dữ liệu đóng góp cho dự án này.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {donations.map((tx) => {
                            const isReversed = tx.status === 'REFUNDED';
                            const donor = tx.donorRef;

                            return (
                                <div
                                    key={tx._id}
                                    className={`group flex flex-col p-5 rounded-[28px] border transition-all duration-300 ${isReversed
                                            ? 'bg-slate-50/50 border-slate-100 opacity-70'
                                            : 'bg-white border-slate-100 hover:border-amber-200 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                                                {donor?.avatar ? (
                                                    <img
                                                        src={donor.avatar}
                                                        alt="avatar"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserCircle2 className="text-slate-300 w-full h-full p-1" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-bold transition-colors ${isReversed ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-amber-600'
                                                    }`}>
                                                    {donor?.fullName || "Nhà hảo tâm ẩn danh"}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                                                    <Calendar size={12} />
                                                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: vi })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-lg font-black ${isReversed ? 'text-rose-400 line-through' : 'text-emerald-600'
                                                }`}>
                                                {isReversed ? '-' : '+'}{tx.amount.toLocaleString()}đ
                                            </p>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isReversed ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {isReversed ? 'REFUNDED' : 'SUCCESSFUL'}
                                            </span>
                                        </div>
                                    </div>

                                    {tx.message && !isReversed && (
                                        <div className="mt-4 relative ml-14">
                                            <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-amber-100 rounded-full" />
                                            <div className="bg-slate-50/80 rounded-2xl rounded-tl-none p-3 border border-slate-100/50">
                                                <div className="flex gap-2 text-slate-600 italic text-sm leading-relaxed">
                                                    <MessageCircle size={14} className="mt-1 flex-shrink-0 text-amber-400" />
                                                    <p>{tx.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasNextPage && (
                    <div className="pt-6 flex justify-center">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="group flex items-center gap-2 px-10 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-amber-500 hover:text-slate-900 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-slate-900"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang tải dữ liệu...
                                </>
                            ) : (
                                <>
                                    Xem thêm lượt quyên góp
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}