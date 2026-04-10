import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { useWithdrawMutation } from '../hooks/useTransactionMutations';
import { useBankAccounts } from '@/features/bank/hooks/useBankQueries';
import { useMyWallet } from '@/features/wallet/hooks/useWalletQueries';
import { AlertCircle, ArrowDownToLine, Banknote } from 'lucide-react';

export function WithdrawModal({ isOpen, onClose }) {
    const { data: wallet } = useMyWallet();
    const { data: accounts } = useBankAccounts();
    const withdrawMutation = useWithdrawMutation();

    const maxBalance = wallet?.balance || 0;
    const verifiedAccounts = accounts?.filter(acc => acc.isVerified) || [];

    const withdrawSchema = z.object({
        amount: z.coerce.number()
            .min(50000, 'Số tiền rút tối thiểu là 50.000đ')
            .max(maxBalance, 'Vượt quá số dư ví hiện tại'),
        bankAccountId: z.string().min(1, 'Vui lòng chọn thẻ ngân hàng'),
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(withdrawSchema),
    });

    const handleClose = () => {
        if (withdrawMutation.isPending) return;
        reset();
        onClose();
    };

    const onSubmit = (data) => {
        withdrawMutation.mutate(data, {
            onSuccess: () => {
                handleClose();
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Rút tiền về thẻ">
            {verifiedAccounts.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-amber-600 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có thẻ hợp lệ</h3>
                    <p className="text-sm text-slate-500 mb-6">Bạn cần thêm và xác thực (Micro-deposit) ít nhất 1 thẻ ngân hàng trước khi rút tiền.</p>
                    <button onClick={handleClose} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl">
                        Đóng
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                        <span className="text-sm font-semibold text-slate-500">Số dư khả dụng:</span>
                        <span className="text-lg font-extrabold text-emerald-600">{maxBalance.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Số tiền muốn rút (VNĐ)</label>
                        <div className="relative">
                            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="number"
                                {...register('amount')}
                                placeholder="VD: 50000"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-amber-400 font-bold text-slate-900"
                            />
                        </div>
                        {errors.amount && <p className="text-rose-500 text-xs font-semibold mt-2">{errors.amount.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Rút về thẻ</label>
                        <select
                            {...register('bankAccountId')}
                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-amber-400 font-medium text-slate-700 cursor-pointer"
                        >
                            <option value="">-- Chọn thẻ ngân hàng --</option>
                            {verifiedAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.bankName} (**** {acc.accountNumber.slice(-4)})
                                </option>
                            ))}
                        </select>
                        {errors.bankAccountId && <p className="text-rose-500 text-xs font-semibold mt-2">{errors.bankAccountId.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={withdrawMutation.isPending}
                        className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50"
                    >
                        <ArrowDownToLine size={20} />
                        {withdrawMutation.isPending ? 'Đang xử lý...' : 'Tạo lệnh rút tiền'}
                    </button>
                </form>
            )}
        </Modal>
    );
}