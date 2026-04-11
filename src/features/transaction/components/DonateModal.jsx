import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/shared/components/ui/Modal';
import { useDonateMutation } from '../hooks/useTransactionMutations';
import { useMyWallet } from '@/features/wallet/hooks/useWalletQueries';
import { CreditCard, Wallet, ExternalLink, ShieldCheck, EyeOff } from 'lucide-react';
import { globalEventBus, APP_EVENTS } from '@/shared/lib/eventBus';

const donateSchema = z.object({
    amount: z.number().min(2000, 'Số tiền ủng hộ tối thiểu là 2.000đ'),
    paymentMethod: z.enum(['PAYOS', 'WALLET']),
    isAnonymous: z.boolean().optional().default(false),
});

const SUGGESTED_AMOUNTS = [50000, 100000, 200000, 500000];

export function DonateModal({ isOpen, onClose, projectId, projectTitle, projectStatus }) {
    const [payOsData, setPayOsData] = useState(null);
    const [displayAmount, setDisplayAmount] = useState('');

    const { data: wallet } = useMyWallet();
    const donateMutation = useDonateMutation();

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
        resolver: zodResolver(donateSchema),
        defaultValues: { paymentMethod: 'PAYOS', amount: 0, isAnonymous: false }
    });

    const selectedMethod = watch('paymentMethod');
    const watchAmount = watch('amount');

    useEffect(() => {
        if (isOpen) {
            setDisplayAmount('');
            reset({ paymentMethod: 'PAYOS', amount: 0, isAnonymous: false });
            setPayOsData(null);
        }
    }, [isOpen, reset]);

    const handleClose = () => {
        onClose();
    };

    const handleCloseRef = useRef(handleClose);

    useEffect(() => {
        handleCloseRef.current = handleClose;
    });

    useEffect(() => {
        if (!isOpen || !projectId) return;

        const handleDonationSuccess = (event) => {
            if (event.detail?.projectId === String(projectId)) {
                handleCloseRef.current();
            }
        };

        globalEventBus.addEventListener(APP_EVENTS.DONATION_SUCCESS, handleDonationSuccess);
        return () => {
            globalEventBus.removeEventListener(APP_EVENTS.DONATION_SUCCESS, handleDonationSuccess);
        };
    }, [isOpen, projectId]);

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (!rawValue) {
            setDisplayAmount('');
            setValue('amount', 0, { shouldValidate: true });
            return;
        }
        const num = parseInt(rawValue, 10);
        setDisplayAmount(num.toLocaleString('vi-VN'));
        setValue('amount', num, { shouldValidate: true });
    };

    const handleSuggestClick = (val) => {
        setDisplayAmount(val.toLocaleString('vi-VN'));
        setValue('amount', val, { shouldValidate: true });
    };

    const onSubmit = (data) => {
        if (projectStatus && projectStatus !== 'FUNDING') {
            handleClose();
            return;
        }

        const payload = {
            projectId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            isAnonymous: data.isAnonymous,
            returnUrl: `${window.location.origin}/payment/result?status=success`,
            cancelUrl: `${window.location.origin}/payment/result?status=cancel&cancel=true`,
        };

        donateMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res.data.paymentMethod === 'PAYOS') {
                    setPayOsData(res.data);
                } else {
                    handleClose();
                }
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Ủng hộ dự án">
            {!payOsData ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <ShieldCheck className="mt-0.5 flex-shrink-0 text-amber-600" size={20} />
                        <div>
                            <p className="text-sm font-bold text-amber-900">Mọi đóng góp đều được bảo vệ</p>
                            <p className="mt-1 line-clamp-1 text-xs text-amber-700">{projectTitle}</p>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Số tiền ủng hộ (VNĐ)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={displayAmount}
                            onChange={handleAmountChange}
                            placeholder="VD: 50,000"
                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-2xl font-bold tracking-wider text-slate-900 outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
                        />
                        {errors.amount && <p className="mt-2 text-xs font-semibold text-rose-500">{errors.amount.message}</p>}

                        <div className="mt-3 grid grid-cols-4 gap-2">
                            {SUGGESTED_AMOUNTS.map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSuggestClick(val)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                >
                                    {(val / 1000)}k
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Nguồn tiền</label>

                        <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${selectedMethod === 'PAYOS' ? 'border-amber-400 bg-amber-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedMethod === 'PAYOS' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Chuyển khoản VietQR</p>
                                    <p className="text-xs text-slate-500">Quét mã bằng App ngân hàng</p>
                                </div>
                            </div>
                            <input type="radio" value="PAYOS" className="hidden" onClick={() => setValue('paymentMethod', 'PAYOS')} />
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedMethod === 'PAYOS' ? 'border-amber-500' : 'border-slate-300'}`}>
                                {selectedMethod === 'PAYOS' && <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
                            </div>
                        </label>

                        <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${selectedMethod === 'WALLET' ? 'border-amber-400 bg-amber-50/50' : 'border-slate-100 bg-white hover:border-slate-200'} ${(wallet?.balance || 0) < watchAmount ? 'cursor-not-allowed opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedMethod === 'WALLET' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Ví CCNet của tôi</p>
                                    <p className="text-xs text-slate-500">Số dư: {(wallet?.balance || 0).toLocaleString('vi-VN')} đ</p>
                                </div>
                            </div>
                            <input
                                type="radio"
                                value="WALLET"
                                disabled={(wallet?.balance || 0) < watchAmount}
                                className="hidden"
                                onClick={() => setValue('paymentMethod', 'WALLET')}
                            />
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedMethod === 'WALLET' ? 'border-amber-500' : 'border-slate-300'}`}>
                                {selectedMethod === 'WALLET' && <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
                            </div>
                        </label>
                        {selectedMethod === 'WALLET' && (wallet?.balance || 0) < watchAmount && (
                            <p className="text-right text-xs font-semibold text-rose-500">Số dư ví không đủ để thanh toán mức này.</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                            <input
                                type="checkbox"
                                {...register('isAnonymous')}
                                className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                    Quyên góp ẩn danh <EyeOff size={14} className="text-slate-400" />
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Tên của bạn sẽ được giấu trên sao kê của dự án</span>
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={donateMutation.isPending || watchAmount < 2000}
                        className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                    >
                        {donateMutation.isPending ? 'Đang khởi tạo giao dịch...' : 'Xác nhận ủng hộ'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
                    <p className="font-medium text-slate-500">Mở App ngân hàng bất kỳ để quét mã QR</p>

                    <div className="mx-auto flex w-fit items-center justify-center rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <QRCodeSVG
                            value={payOsData.qrCode}
                            size={220}
                            level="M"
                            includeMargin={false}
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <a
                            href={payOsData.checkoutUrl}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3.5 font-bold text-slate-900 transition-colors hover:bg-amber-500"
                        >
                            <ExternalLink size={18} /> Chuyển đến cổng thanh toán
                        </a>
                        <button
                            onClick={handleClose}
                            className="w-full rounded-2xl bg-slate-100 py-3.5 font-bold text-slate-600 transition-colors hover:bg-slate-200"
                        >
                            Đóng cửa sổ này
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}