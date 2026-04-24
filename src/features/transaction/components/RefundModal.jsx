import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { useRefundMutation } from '../hooks/useTransactionMutations';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const refundSchema = z.object({
    reason: z.string().max(255, 'Lý do không quá 255 ký tự').optional(),
});

export function RefundModal({ isOpen, onClose, transaction }) {
    const refundMutation = useRefundMutation();
    const { register, handleSubmit, reset } = useForm({
        resolver: zodResolver(refundSchema),
    });

    if (!transaction) return null;

    const penaltyRate = 0.02; 
    const originalAmount = transaction.amount;
    const penaltyFee = Math.round(originalAmount * penaltyRate);
    const refundAmount = originalAmount - penaltyFee;

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = (data) => {
        refundMutation.mutate({ id: transaction._id, reason: data.reason }, {
            onSuccess: () => handleClose(),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Xác nhận hoàn tiền">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex gap-3">
                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                        Yêu cầu hoàn tiền chỉ được thực hiện trong vòng 72h kể từ khi đóng góp và dự án vẫn đang trong giai đoạn gọi vốn.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Số tiền gốc (Đã quyên góp):</span>
                        <span className="font-bold text-slate-900">{originalAmount.toLocaleString()}đ</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                            Phí chống spam (Giữ lại dự án):
                        </span>
                        <span className="font-bold text-rose-600">-{penaltyFee.toLocaleString()}đ</span>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-base font-bold text-slate-900">Tiền dự kiến nhận về Ví:</span>
                        <span className="text-xl font-black text-emerald-600">{refundAmount.toLocaleString()}đ</span>
                    </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3">
                    <ShieldCheck className="text-emerald-600 mt-0.5" size={16} />
                    <p className="text-xs text-emerald-700 font-medium">
                        Yêu cầu hoàn tiền sẽ được quản trị viên kiểm tra và duyệt. Sau khi duyệt, {refundAmount.toLocaleString()}đ sẽ về ví của bạn và {penaltyFee.toLocaleString()}đ được giữ lại làm phí duy trì nền tảng.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Lý do hoàn tiền (Tùy chọn)</label>
                    <textarea
                        {...register('reason')}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-amber-400"
                        placeholder="Hãy cho chúng tôi biết lý do..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={handleClose} className="py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                    <button
                        type="submit"
                        disabled={refundMutation.isPending}
                        className="py-3.5 rounded-2xl font-bold text-white bg-slate-900 hover:bg-rose-600 transition-colors disabled:opacity-50"
                    >
                        Gửi yêu cầu hoàn tiền
                    </button>
                </div>
            </form>
        </Modal>
    );
}
