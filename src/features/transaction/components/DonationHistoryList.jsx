import { useState } from 'react';
import { useMyDonations } from '../hooks/useDonationQueries';
import { useUpdateDonationMessageMutation } from '../hooks/useTransactionMutations';
import { differenceInHours } from 'date-fns';
import { RefundModal } from './RefundModal';
import { SuspenseClaimModal } from './SuspenseClaimModal';
import {
    Heart,
    RotateCcw,
    MessageCircle,
    UserCircle,
    ShieldQuestion,
    Edit3,
    EyeOff,
    ChevronRight,
    History
} from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';

export function DonationHistoryList() {
    const [page] = useState(1);
    const { data, isLoading } = useMyDonations({ page, limit: 15 });
    const [selectedTxForRefund, setSelectedTxForRefund] = useState(null);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

    const updateMessageMutation = useUpdateDonationMessageMutation();
    const toast = useToast();

    if (isLoading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 w-full bg-slate-100 animate-pulse rounded-[24px]" />
            ))}
        </div>
    );

    const donations = data?.donations || [];

    const checkIsRefundable = (createdAt, projectStatus) => {
        const hours = differenceInHours(new Date(), new Date(createdAt));
        return hours < 72 && projectStatus === 'FUNDING';
    };

    const handleEditMessage = (tx) => {
        const newMessage = prompt("Nhập lời nhắn mới của bạn (Tối đa 500 ký tự):", tx.message || "");
        if (newMessage === null) return;

        if (newMessage.length > 500) {
            toast.error("Lời nhắn quá dài (Tối đa 500 ký tự)");
            return;
        }

        updateMessageMutation.mutate({
            id: tx._id,
            payload: { message: newMessage, isAnonymous: tx.isAnonymous }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[28px] text-white shadow-xl shadow-slate-200">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <ShieldQuestion className="text-amber-400" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-base">Không thấy giao dịch vừa chuyển?</h4>
                        <p className="text-slate-400 text-xs font-medium">Đừng lo lắng, hãy nộp biên lai để chúng tôi tra soát ngay.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    Tra soát biên lai <ChevronRight size={16} />
                </button>
            </div>

            {donations.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                    <History className="mx-auto text-slate-200 mb-4" size={56} />
                    <p className="text-slate-500 font-bold text-lg">Lịch sử trống</p>
                    <p className="text-slate-400 text-sm mb-6">Bạn chưa có giao dịch quyên góp nào.</p>
                    <button
                        onClick={() => setIsClaimModalOpen(true)}
                        className="text-amber-600 font-bold hover:underline"
                    >
                        Thử tra soát giao dịch cũ?
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {donations.map((tx) => {
                        const isRefunded = tx.type === 'REFUND' || tx.status === 'REFUNDED';
                        const isRefundable = checkIsRefundable(tx.createdAt, tx.projectId?.status);

                        return (
                            <div
                                key={tx._id}
                                className={`group relative bg-white border p-6 rounded-[32px] transition-all hover:shadow-md ${isRefunded ? 'opacity-75 border-slate-100' : 'border-slate-200'}`}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${isRefunded ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {isRefunded ? 'Đã hoàn tiền' : 'Thành công'}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium italic">
                                                ID: {tx.bankTransactionRef || tx._id.slice(-8).toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight hover:text-amber-600 transition-colors cursor-pointer">
                                            {tx.projectId?.title || 'Dự án không xác định'}
                                        </h3>

                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-slate-900">
                                                {tx.amount.toLocaleString()}
                                            </span>
                                            <span className="text-sm font-bold text-slate-500">VNĐ</span>
                                        </div>

                                        <div className="pt-2 flex flex-col gap-2">
                                            {tx.message && (
                                                <div className="relative pl-4 border-l-4 border-amber-200 py-1">
                                                    <p className="text-sm text-slate-600 italic font-medium leading-relaxed">
                                                        "{tx.message}"
                                                    </p>
                                                    {!isRefunded && (
                                                        <button
                                                            onClick={() => handleEditMessage(tx)}
                                                            className="absolute -right-2 -top-2 p-1.5 bg-slate-50 rounded-full text-slate-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all"
                                                            title="Sửa lời nhắn"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-4 pt-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                    <UserCircle size={14} className="text-slate-400" />
                                                    {tx.isAnonymous ? (
                                                        <span className="flex items-center gap-1 text-amber-600">
                                                            <EyeOff size={12} /> Ẩn danh
                                                        </span>
                                                    ) : 'Công khai'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                    <MessageCircle size={14} className="text-slate-400" />
                                                    {tx.message ? 'Có lời nhắn' : (
                                                        <button
                                                            onClick={() => handleEditMessage(tx)}
                                                            className="text-amber-600 hover:underline"
                                                        >
                                                            + Thêm lời nhắn
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-4 min-w-[140px]">
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Ngày thực hiện</p>
                                            <p className="text-sm font-extrabold text-slate-700">
                                                {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>

                                        <div className="w-full md:w-auto">
                                            {isRefunded ? (
                                                <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black uppercase text-center flex items-center gap-2">
                                                    <RotateCcw size={14} /> Tiền đã về ví
                                                </div>
                                            ) : isRefundable ? (
                                                <button
                                                    onClick={() => setSelectedTxForRefund(tx)}
                                                    className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600 text-xs font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    <RotateCcw size={14} /> Xin hoàn tiền
                                                </button>
                                            ) : (
                                                <div className="px-4 py-2 rounded-2xl bg-slate-50 text-slate-400 text-[10px] font-bold uppercase text-center border border-slate-100">
                                                    Đã kết thúc kỳ hoàn
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <RefundModal
                isOpen={!!selectedTxForRefund}
                onClose={() => setSelectedTxForRefund(null)}
                transaction={selectedTxForRefund}
            />

            <SuspenseClaimModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
            />
        </div>
    );
}