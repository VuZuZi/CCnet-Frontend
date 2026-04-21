import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { useAddBankAccount } from '../hooks/useBankMutations';
import { useVietnamBanks } from '@/features/users/hooks/useVietnamBanks';
import { BankAutocomplete } from '@/features/users/components/organizerRequest/BankAutocomplete';

const bankSchema = z.object({
    bankName: z.string().min(2, 'Tên ngân hàng tối thiểu 2 ký tự').max(100),
    accountNumber: z.string().min(5, 'Số tài khoản không hợp lệ').max(50),
    accountName: z.string().min(2, 'Tên chủ thẻ không hợp lệ').max(150),
});

export function AddBankModal({ isOpen, onClose }) {
    const addBankMutation = useAddBankAccount();
    const { banks, isLoading: isBanksLoading } = useVietnamBanks();

    const bankForm = useForm({ resolver: zodResolver(bankSchema) });

    const resolveBank = (value) => {
        const normalizedValue = String(value || '').trim();

        return banks.find((bank) => (
            bank.shortName === normalizedValue ||
            bank.name === normalizedValue ||
            bank.code === normalizedValue ||
            bank.displayLabel === normalizedValue
        ));
    };

    const handleClose = () => {
        if (addBankMutation.isPending) return;
        bankForm.reset();
        onClose();
    };

    const onSubmitBank = (data) => {
        const selectedBank = resolveBank(data.bankName);

        if (!selectedBank) {
            bankForm.setError('bankName', {
                type: 'manual',
                message: 'Vui lòng chọn ngân hàng từ danh sách gợi ý',
            });
            return;
        }

        addBankMutation.mutate({
            ...data,
            bankName: selectedBank.shortName || selectedBank.name,
        }, {
            onSuccess: () => handleClose(),
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Thêm Thẻ Ngân Hàng"
        >
            <form onSubmit={bankForm.handleSubmit(onSubmitBank)} className="space-y-4">
                <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200">
                    Chỉ cần nhập đúng ngân hàng, số tài khoản và tên tài khoản. Hệ thống sẽ lưu và xác thực ngay.
                </div>
                <Controller
                    name="bankName"
                    control={bankForm.control}
                    render={({ field }) => (
                        <BankAutocomplete
                            value={field.value || ''}
                            onChange={field.onChange}
                            banks={banks}
                            isLoading={isBanksLoading}
                            error={bankForm.formState.errors.bankName?.message}
                            placeholder="Tìm ngân hàng bạn đang dùng"
                        />
                    )}
                />
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Số tài khoản</label>
                    <input {...bankForm.register('accountNumber')} placeholder="VD: 1903..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-amber-400" />
                    {bankForm.formState.errors.accountNumber && <span className="text-xs text-red-500">{bankForm.formState.errors.accountNumber.message}</span>}
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tên chủ thẻ (In hoa không dấu)</label>
                    <input {...bankForm.register('accountName')} placeholder="VD: NGUYEN VAN A" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 uppercase outline-none focus:border-amber-400" />
                    {bankForm.formState.errors.accountName && <span className="text-xs text-red-500">{bankForm.formState.errors.accountName.message}</span>}
                </div>

                <button type="submit" disabled={addBankMutation.isPending} className="mt-4 w-full rounded-xl bg-amber-400 py-3 font-bold text-slate-900 transition hover:bg-amber-500 disabled:opacity-50">
                    {addBankMutation.isPending ? 'Đang xử lý...' : 'Lưu và hoàn tất'}
                </button>
            </form>
        </Modal>
    );
}