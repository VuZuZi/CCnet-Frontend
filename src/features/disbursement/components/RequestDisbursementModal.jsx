import React from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { useCreateDisbursementMutation } from '../hooks/useDisbursementMutations';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { Wallet, Info, Send, AlertTriangle } from 'lucide-react';

export function RequestDisbursementModal({ project, milestone, onClose }) {
    const { mutate: createRequest, isPending } = useCreateDisbursementMutation();

    const withdrawableBalance = Number(project?.financialOverview?.withdrawableBalance || 0);
    const requiredDisbursementAmount = Number(
        milestone?.requiredDisbursementAmount ?? milestone?.targetAmount ?? 0
    );
    const requiresDisbursement = requiredDisbursementAmount > 0;
    const hasNoWithdrawableBalance = withdrawableBalance < requiredDisbursementAmount;
    const canAttemptRequest = requiresDisbursement && !hasNoWithdrawableBalance;

    const handleConfirm = () => {
        if (!canAttemptRequest) return;
        
        createRequest({
            projectId: project._id,
            milestoneId: milestone.milestoneId
        }, {
            onSuccess: onClose
        });
    };

    return (
        <Modal open onClose={onClose} title="Yêu cầu giải ngân ngân sách" size="max-w-md">
            <div className="space-y-6">
                <div className="rounded-2xl bg-slate-900 p-6 text-white overflow-hidden relative shadow-lg">
                    <Wallet className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số tiền cần giải ngân</p>
                    <h3 className="mt-2 text-3xl font-black">{formatProjectCurrencyVND(requiredDisbursementAmount)}</h3>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                        <p className="text-[11px] text-slate-400">Khả dụng trong ví ký quỹ:</p>
                        <p className={`text-xs font-bold ${hasNoWithdrawableBalance ? 'text-red-400' : 'text-blue-400'}`}>
                            {formatProjectCurrencyVND(withdrawableBalance)}
                        </p>
                    </div>
                </div>

                {!requiresDisbursement ? (
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex gap-3">
                        <Info className="text-slate-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                            Mốc này không có ngân sách (0đ), bạn không cần gửi yêu cầu giải ngân.
                        </p>
                    </div>
                ) : hasNoWithdrawableBalance ? (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex gap-3">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                            Hiện không còn số dư khả dụng trong tài khoản ký quỹ để tạo yêu cầu giải ngân. Vui lòng kiểm tra mốc trước hoặc liên hệ quản trị viên.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100/50 flex gap-3">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-blue-900">Trích xuất tự động (Zero-Trust)</p>
                            <p className="text-[11px] text-blue-800 leading-relaxed">
                                Hệ thống sẽ giải ngân vào <strong>Tài khoản ngân hàng mặc định</strong> đã KYC của bạn sau khi kế toán duyệt (1-3 ngày).
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} disabled={isPending} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Hủy bỏ
                    </button>
                    <button type="button" onClick={handleConfirm} disabled={isPending || !canAttemptRequest} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200">
                        {isPending ? "Đang xử lý..." : <><Send size={16} /> Xác nhận & Gửi</>}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
