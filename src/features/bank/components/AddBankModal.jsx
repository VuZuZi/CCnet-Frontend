import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { useAddBankAccount, useVerifyBankAccount } from '../hooks/useBankMutations';
import { env } from '@/config/env';
import { devConfig } from '@/config/app.config';
import { useVietnamBanks } from '@/features/users/hooks/useVietnamBanks';
import { BankAutocomplete } from '@/features/users/components/organizerRequest/BankAutocomplete';

const bankSchema = z.object({
    bankName: z.string().min(2, 'Tên ngân hàng tối thiểu 2 ký tự').max(100),
    accountNumber: z.string().min(5, 'Số tài khoản không hợp lệ').max(50),
    accountName: z.string().min(2, 'Tên chủ thẻ không hợp lệ').max(150),
});

const verifySchema = z.object({
    amount: z.coerce.number().min(1000, 'Số tiền tối thiểu 1.000đ').max(9999, 'Số tiền tối đa 9.999đ'),
});

export function AddBankModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1); // 1: Info, 2: Verify OTP
    const [verificationData, setVerificationData] = useState(null);

    const addBankMutation = useAddBankAccount();
    const verifyMutation = useVerifyBankAccount();
    const { banks, isLoading: isBanksLoading } = useVietnamBanks();

    const bankForm = useForm({ resolver: zodResolver(bankSchema) });
    const verifyForm = useForm({ resolver: zodResolver(verifySchema) });

    const handleClose = () => {
        if (addBankMutation.isPending || verifyMutation.isPending) return;
        bankForm.reset();
        verifyForm.reset();
        setStep(1);
        setVerificationData(null);
        onClose();
    };

    const onSubmitBank = (data) => {
        const isSupportedBank = banks.some((bank) => bank.name === data.bankName);

        if (!isSupportedBank) {
            bankForm.setError('bankName', {
                type: 'manual',
                message: 'Vui lòng chọn ngân hàng từ danh sách gợi ý',
            });
            return;
        }

        addBankMutation.mutate(data, {
            onSuccess: (res) => {
                setVerificationData({
                    bankAccountId: res.data.bankAccountId,
                    mockAmountForTesting: res.data.mockAmountForTesting
                });
                setStep(2);
            }
        });
    };

    const onSubmitVerify = (data) => {
        verifyMutation.mutate({
            id: verificationData.bankAccountId,
            amount: data.amount
        }, {
            onSuccess: () => {
                handleClose();
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={step === 1 ? 'Thêm Thẻ Ngân Hàng' : 'Xác Thực Thẻ (Chuyển khoản thử)'}
        >
            {step === 1 ? (
                <form onSubmit={bankForm.handleSubmit(onSubmitBank)} className="space-y-4">
                    <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                        Hệ thống sẽ chuyển một khoản tiền nhỏ (1.000đ - 9.999đ) vào tài khoản của bạn để xác thực.
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
                        {addBankMutation.isPending ? 'Đang xử lý...' : 'Tiếp tục'}
                    </button>
                </form>
            ) : (
                <form onSubmit={verifyForm.handleSubmit(onSubmitVerify)} className="space-y-4">
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
                        Vui lòng kiểm tra app ngân hàng và nhập <b>chính xác số tiền</b> CCNet vừa chuyển để xác minh bạn là chủ thẻ.
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Số tiền nhận được (VNĐ)</label>
                        <input type="number" {...verifyForm.register('amount')} placeholder="VD: 3450" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-lg font-bold tracking-widest outline-none focus:border-amber-400" />
                        {verifyForm.formState.errors.amount && <span className="text-xs text-red-500">{verifyForm.formState.errors.amount.message}</span>}
                    </div>

                    {env.IS_DEV && (
                        <button
                            type="button"
                            onClick={() => {
                                devConfig.log('Auto-filling test amount:', verificationData?.mockAmountForTesting);
                                verifyForm.setValue('amount', verificationData?.mockAmountForTesting);
                            }}
                            className="w-full rounded-lg bg-slate-800 py-2 text-xs font-bold text-white opacity-70 hover:opacity-100"
                        >
                            [DÀNH CHO DEV] Điền nhanh số tiền thử: {verificationData?.mockAmountForTesting}
                        </button>
                    )}

                    <button type="submit" disabled={verifyMutation.isPending} className="mt-4 w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">
                        {verifyMutation.isPending ? 'Đang xác thực...' : 'Xác nhận chủ thẻ'}
                    </button>
                </form>
            )}
        </Modal>
    );
}