import { useState } from 'react';
import { useMyDonations } from '../hooks/useDonationQueries';
import { differenceInHours } from 'date-fns';
import { RefundModal } from './RefundModal';
import { Heart, RotateCcw } from 'lucide-react';

export function DonationHistoryList() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyDonations({ page, limit: 10 });
    const [selectedTx, setSelectedTx] = useState(null);

    if (isLoading) return <div className="p-8 text-center text-slate-400 animate-pulse">Đang tải lịch sử ủng hộ...</div>;

    const donations = data?.donations || [];

    const checkIsRefundable = (createdAt, projectStatus) => {
        const hours = differenceInHours(new Date(), new Date(createdAt));
        return hours < 72 && projectStatus === 'FUNDING';
    };

    return (
        <div className="space-y-4">
            {donations.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                    <Heart className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Bạn chưa thực hiện khoản ủng hộ nào.</p>
                </div>
            ) : (
                donations.map((tx) => {
                    const isRefundable = checkIsRefundable(tx.createdAt, tx.projectId?.status);
                    const isRefunded = tx.reconciled; // Đọc trực tiếp từ data record

                    return (
                        <div 
                            key={tx._id} 
                            className={`rounded-[24px] border p-5 flex flex-col md:flex-row gap-5 items-start md:items-center transition-all ${isRefunded ? 'border-slate-100 opacity-80 bg-slate-50/30' : 'bg-white border-slate-100 hover:shadow-md'}`}
                        >
                            <img
                                src={tx.projectId?.coverMedia?.url}
                                className={`w-full md:w-32 h-20 object-cover rounded-2xl ${isRefunded ? 'grayscale opacity-70' : 'bg-slate-100'}`}
                                alt="project"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold truncate ${isRefunded ? 'text-slate-400' : 'text-slate-900'}`}>
                                    {tx.projectId?.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-lg font-black ${isRefunded ? 'text-slate-400 line-through' : 'text-amber-500'}`}>
                                        {tx.amount.toLocaleString()}đ
                                    </span>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isRefunded ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {isRefunded ? 'ĐÃ HOÀN TIỀN' : tx.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Ngày ủng hộ: {new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {isRefunded ? (
                                    <span className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold inline-flex items-center gap-2">
                                        <RotateCcw size={14} /> Giao dịch đã hoàn trả
                                    </span>
                                ) : isRefundable ? (
                                    <button
                                        onClick={() => setSelectedTx(tx)}
                                        className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors inline-flex items-center gap-2"
                                    >
                                        <RotateCcw size={14} /> Xin hoàn tiền
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })
            )}

            <RefundModal
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                transaction={selectedTx}
            />
        </div>
    );
}