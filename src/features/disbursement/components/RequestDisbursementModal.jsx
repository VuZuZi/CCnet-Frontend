import React from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { useCreateDisbursementMutation } from '../hooks/useDisbursementMutations';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { Wallet, Info, Send } from 'lucide-react';

export function RequestDisbursementModal({ projectId, milestone, onClose }) {
    const { mutate: createRequest, isPending } = useCreateDisbursementMutation();

    const handleConfirm = () => {
        createRequest({
            projectId,
            milestoneId: milestone.milestoneId
            // Tuyệt đối không truyền bankAccountId theo đúng kiến trúc Zero-Trust
            // Backend sẽ tự map Tài khoản ngân hàng mặc định của Organizer
        }, {
            onSuccess: onClose
        });
    };

    return (
        <Modal open onClose={onClose} title="Yêu cầu giải ngân ngân sách" size="max-w-md">
            <div className="space-y-6">
                {/* Header Thông tin số tiền */}
                <div className="rounded-2xl bg-slate-900 p-6 text-white overflow-hidden relative shadow-lg">
                    <Wallet className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số tiền được giải ngân</p>
                    <h3 className="mt-2 text-3xl font-black">{formatProjectCurrencyVND(milestone.targetAmount)}</h3>
                    <p className="mt-2 text-[11px] text-slate-400 italic">
                        * Dựa trên nghiệm thu giai đoạn: "{milestone.title}"
                    </p>
                </div>

                {/* Thông tin quy trình & Zero-Trust Alert */}
                <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100/50">
                    <div className="flex gap-3">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-blue-900">
                                Trích xuất tài khoản tự động
                            </p>
                            <p className="text-[11px] text-blue-800 leading-relaxed">
                                Hệ thống sẽ tự động chuyển tiền vào <strong>Tài khoản ngân hàng mặc định</strong> đã được xác thực (Verified KYC) trong hồ sơ của bạn. Thời gian xử lý từ 1-3 ngày làm việc sau khi Ban quản trị phê duyệt.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 disabled:shadow-none transition-all shadow-lg shadow-slate-200"
                    >
                        {isPending ? "Đang gửi yêu cầu..." : <><Send size={16} /> Xác nhận & Gửi</>}
                    </button>
                </div>
            </div>
        </Modal>
    );
}