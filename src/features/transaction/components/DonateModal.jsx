import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/shared/components/ui/Modal';
import { useDonateMutation, useCheckStatusMutation } from '../hooks/useTransactionMutations';
import { useMyWallet } from '@/features/wallet/hooks/useWalletQueries';
import { WALLET_QUERY_KEYS } from '@/features/wallet/constants/wallet.queryKeys';
import { TRANSACTION_QUERY_KEYS } from '../constants/transaction.queryKeys';
import { CreditCard, Wallet, ShieldCheck, EyeOff, CheckCircle2, Loader2, MessageSquareHeart, Info } from 'lucide-react';
import { globalEventBus, APP_EVENTS } from '@/shared/lib/eventBus';
import { useToast } from '@/shared/contexts/ToastContext';
import { SuspenseClaimModal } from './SuspenseClaimModal';
import { useTransactionStatusStream } from '../hooks/useTransactionStatusStream';

const PAYMENT_METHODS = {
    BANK_TRANSFER: 'BANK_TRANSFER',
    WALLET: 'WALLET'
};

const donateSchema = z.object({
    amount: z.number().min(2000, 'Số tiền ủng hộ tối thiểu là 2.000đ'),
    paymentMethod: z.enum([PAYMENT_METHODS.BANK_TRANSFER, PAYMENT_METHODS.WALLET]),
    isAnonymous: z.boolean().optional().default(false),
    message: z.string().max(500, 'Lời nhắn tối đa 500 ký tự').optional(),
});

const SUGGESTED_AMOUNTS = [50000, 100000, 200000, 500000];

export function DonateModal({ isOpen, onClose, projectId, projectTitle, projectStatus, currentFundedAmount = 0, targetAmount = 0 }) {
    const [bankTransferData, setBankTransferData] = useState(null);
    const [displayAmount, setDisplayAmount] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const resetTimeoutRef = useRef(null);

    const { data: wallet } = useMyWallet();
    const queryClient = useQueryClient();
    const donateMutation = useDonateMutation();
    const checkStatusMutation = useCheckStatusMutation();
    const toast = useToast();

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset, setError, clearErrors } = useForm({
        resolver: zodResolver(donateSchema),
        defaultValues: { paymentMethod: PAYMENT_METHODS.BANK_TRANSFER, amount: 0, isAnonymous: false, message: '' }
    });

    const safeTargetAmount = Number(targetAmount || 0);
    const safeFundedAmount = Number(currentFundedAmount || 0);
    const remainingAmount = safeTargetAmount > 0
        ? Math.max(safeTargetAmount - safeFundedAmount, 0)
        : Infinity;

    const validateAmountWithinRemaining = (amount) => {
        if (!Number.isFinite(remainingAmount)) return true;
        return amount <= remainingAmount;
    };

    const selectedMethod = watch('paymentMethod');
    const watchAmount = watch('amount');
    const watchMessage = watch('message');

    const handleClose = useCallback(() => {
        onClose();
        resetTimeoutRef.current = setTimeout(() => {
            setDisplayAmount('');
            setIsSuccess(false);
            setBankTransferData(null);
            reset({ paymentMethod: PAYMENT_METHODS.BANK_TRANSFER, amount: 0, isAnonymous: false, message: '' });
        }, 300);
    }, [onClose, reset]);

    const handleCloseRef = useRef(handleClose);
    useEffect(() => {
        handleCloseRef.current = handleClose;
    }, [handleClose]);

    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        };
    }, []);

    useTransactionStatusStream(
        bankTransferData?.transactionId,
        (data) => {
            if (data.status === 'COMPLETED') {
                setIsSuccess(true);
                queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.me() });
                queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }) });
                queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.myDonations() });
                queryClient.invalidateQueries({ queryKey: ['projects', 'detail', projectId] });

                globalEventBus.dispatchEvent(
                    new CustomEvent(APP_EVENTS.DONATION_SUCCESS, {
                        detail: { projectId: String(projectId), status: 'donation_successful' }
                    })
                );

                setTimeout(() => handleCloseRef.current(), 3000);
            }
        }
    );

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (!rawValue) {
            setDisplayAmount('');
            setValue('amount', 0, { shouldValidate: true });
            clearErrors('amount');
            return;
        }
        const num = parseInt(rawValue, 10);

        if (!validateAmountWithinRemaining(num)) {
            setError('amount', {
                type: 'manual',
                message: `Số tiền vượt quá phần còn thiếu (${remainingAmount.toLocaleString('vi-VN')}đ).`
            });
        } else {
            clearErrors('amount');
        }

        setDisplayAmount(num.toLocaleString('vi-VN'));
        setValue('amount', num, { shouldValidate: true });
    };

    const handleSuggestClick = (val) => {
        if (!validateAmountWithinRemaining(val)) return;
        setDisplayAmount(val.toLocaleString('vi-VN'));
        clearErrors('amount');
        setValue('amount', val, { shouldValidate: true });
    };

    const onSubmit = (data) => {
        if (projectStatus && projectStatus !== 'FUNDING') {
            handleClose();
            return;
        }

        if (!validateAmountWithinRemaining(data.amount)) {
            setError('amount', {
                type: 'manual',
                message: `Số tiền vượt quá phần còn thiếu (${remainingAmount.toLocaleString('vi-VN')}đ).`
            });
            return;
        }

        const payload = {
            projectId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            isAnonymous: data.isAnonymous,
            message: data.message
        };

        donateMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res.data?.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER || res.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER) {
                    setBankTransferData(res.data || res);
                } else {
                    setIsSuccess(true);
                    setTimeout(() => handleClose(), 2000);
                }
            }
        });
    };

    const handleManualCheck = () => {
        if (!bankTransferData?.transactionId) return;

        checkStatusMutation.mutate(bankTransferData.transactionId, {
            onSuccess: (data) => {
                if (data.status === 'COMPLETED') {
                    setIsSuccess(true);
                    queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.me() });
                    queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }) });
                    queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.myDonations() });
                    queryClient.invalidateQueries({ queryKey: ['projects', 'detail', projectId] });

                    globalEventBus.dispatchEvent(
                        new CustomEvent(APP_EVENTS.DONATION_SUCCESS, {
                            detail: { projectId: String(projectId), status: 'donation_successful' }
                        })
                    );

                    setTimeout(() => handleCloseRef.current(), 3000);
                } else {
                    toast.info('Hệ thống chưa nhận được thanh toán. Vui lòng chờ thêm ít phút nếu bạn vừa chuyển khoản.');
                }
            }
        });
    };

    const handleOpenClaim = () => {
        onClose();
        setIsClaimModalOpen(true);
    };

    return (
        <>
            <Modal 
                isOpen={isOpen} 
                onClose={handleClose} 
                title={isSuccess ? "Tuyệt vời!" : "Ủng hộ dự án"} 
                // Thu hẹp Modal xuống 400px để tạo tỷ lệ bề ngang đẹp hơn
                maxWidth={!bankTransferData || isSuccess ? "max-w-4xl" : "max-w-[400px]"}
            >
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 duration-500">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Quyên góp thành công!</h3>
                        <p className="text-slate-500 font-medium px-4">
                            Cảm ơn tấm lòng của bạn. Hệ thống đang tự động đóng cửa sổ này...
                        </p>
                    </div>
                ) : !bankTransferData ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                        <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 mb-6">
                            <ShieldCheck className="mt-0.5 flex-shrink-0 text-amber-600" size={20} />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Mọi đóng góp đều được bảo vệ qua tài khoản Ký quỹ</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Số tiền ủng hộ (VNĐ)</label>
                                    {Number.isFinite(remainingAmount) && (
                                        <p className="mb-2 text-xs font-semibold text-amber-700">
                                            Còn thiếu để đạt mục tiêu: {remainingAmount.toLocaleString('vi-VN')}đ
                                        </p>
                                    )}
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
                                                disabled={!validateAmountWithinRemaining(val)}
                                                className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-slate-50 disabled:hover:text-slate-600"
                                            >
                                                {(val / 1000)}k
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <MessageSquareHeart size={16} className="text-slate-400" />
                                        Lời nhắn gửi dự án (Tùy chọn)
                                    </label>
                                    <textarea
                                        {...register('message')}
                                        rows={3}
                                        placeholder="Chia sẻ vài lời động viên..."
                                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-50 resize-none"
                                    />
                                    {errors.message && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.message.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col h-full">
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-slate-700">Nguồn tiền</label>
                                    <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${selectedMethod === PAYMENT_METHODS.BANK_TRANSFER ? 'border-amber-400 bg-amber-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedMethod === PAYMENT_METHODS.BANK_TRANSFER ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Chuyển khoản VietQR</p>
                                                <p className="text-xs text-slate-500">Mở App ngân hàng quét mã miễn phí</p>
                                            </div>
                                        </div>
                                        <input type="radio" value={PAYMENT_METHODS.BANK_TRANSFER} className="hidden" onClick={() => setValue('paymentMethod', PAYMENT_METHODS.BANK_TRANSFER)} />
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedMethod === PAYMENT_METHODS.BANK_TRANSFER ? 'border-amber-500' : 'border-slate-300'}`}>
                                            {selectedMethod === PAYMENT_METHODS.BANK_TRANSFER && <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
                                        </div>
                                    </label>

                                    <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${selectedMethod === PAYMENT_METHODS.WALLET ? 'border-amber-400 bg-amber-50/50' : 'border-slate-100 bg-white hover:border-slate-200'} ${(wallet?.balance || 0) < watchAmount ? 'cursor-not-allowed opacity-50 grayscale' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedMethod === PAYMENT_METHODS.WALLET ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <Wallet size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Ví CCNet của tôi</p>
                                                <p className="text-xs text-slate-500">Số dư: {(wallet?.balance || 0).toLocaleString('vi-VN')} đ</p>
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            value={PAYMENT_METHODS.WALLET}
                                            disabled={(wallet?.balance || 0) < watchAmount}
                                            className="hidden"
                                            onClick={() => setValue('paymentMethod', PAYMENT_METHODS.WALLET)}
                                        />
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedMethod === PAYMENT_METHODS.WALLET ? 'border-amber-500' : 'border-slate-300'}`}>
                                            {selectedMethod === PAYMENT_METHODS.WALLET && <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
                                        </div>
                                    </label>
                                    {selectedMethod === PAYMENT_METHODS.WALLET && (wallet?.balance || 0) < watchAmount && (
                                        <p className="text-right text-xs font-semibold text-rose-500">Số dư ví không đủ để thanh toán mức này.</p>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 flex flex-col gap-4">
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

                                    <button
                                        type="submit"
                                        disabled={donateMutation.isPending || watchAmount < 2000}
                                        className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {donateMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                        {donateMutation.isPending ? 'Đang khởi tạo mã QR...' : 'Xác nhận quyên góp'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    // Cấu trúc lại Container để bám theo tỷ lệ 3:4 (w-full 400px x min-h 530px)
                    <div className="relative flex flex-col items-center justify-between w-full min-h-[530px] animate-in zoom-in-95 duration-300 pb-2">
                        
                        {/* MẢNG BAY RA NGOÀI (Chỉ bật ở xl, đẩy right xa hơn tránh dính viền) */}
                        <div className="hidden xl:block absolute top-4 -right-[400px] w-[340px] rounded-[1.5rem] bg-white border border-slate-200 p-6 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex items-start gap-4">
                                <div className="bg-amber-50 p-2.5 rounded-full shadow-sm flex-shrink-0 border border-amber-100">
                                    <Info className="text-amber-500" size={24} />
                                </div>
                                <div className="space-y-2 pt-1">
                                    <p className="text-base font-bold text-slate-900">Lưu ý quan trọng</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Vui lòng <strong className="text-amber-600 font-semibold bg-amber-50 px-1 py-0.5 rounded">không thay đổi nội dung chuyển khoản</strong> để hệ thống có thể tự động ghi nhận.
                                    </p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-slate-100 my-4"></div>
                            <p className="text-[0.75rem] text-slate-500 leading-relaxed italic">
                                * Khoản quyên góp này được ghi nhận trực tiếp vào quỹ dự án, không cộng thêm phần trăm khi quét QR.
                            </p>
                        </div>

                        {/* NỘI DUNG CHÍNH */}
                        <div className="flex flex-col items-center justify-center flex-1 w-full space-y-5 mt-2">
                            <div className="flex items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                                <QRCodeSVG
                                    value={bankTransferData?.qrCode || bankTransferData?.breakdown?.qrCode}
                                    size={220} // Thu nhỏ nhẹ để bố cục thanh thoát hơn
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                            
                            <div className="text-center space-y-1.5">
                                <p className="font-bold text-slate-900 text-[1.15rem]">Quét mã để thanh toán</p>
                                <p className="text-[0.85rem] font-medium text-slate-500">Sử dụng App ngân hàng bất kỳ có hỗ trợ VietQR</p>
                            </div>

                            {watchMessage && watchMessage.trim() !== '' && (
                                <div className="w-full max-w-[280px] rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4 relative shadow-sm mt-2">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-200 text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                                        <MessageSquareHeart size={12} />
                                        Lời nhắn của bạn
                                    </div>
                                    <p className="text-[0.85rem] text-slate-700 italic text-center mt-1 leading-relaxed line-clamp-3">
                                        "{watchMessage}"
                                    </p>
                                </div>
                            )}

                            {/* Dành cho Tablet/Mobile */}
                            <div className="xl:hidden w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 mt-2">
                                <p className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1"><Info size={16} className="text-amber-500"/> Lưu ý</p>
                                <p className="text-[0.75rem] text-slate-600">Vui lòng không thay đổi nội dung chuyển khoản. Hệ thống sẽ ghi nhận đúng số tiền bạn ủng hộ cho project.</p>
                            </div>
                        </div>

                        {/* BOTTOM ACTIONS */}
                        <div className="w-full mt-auto pt-6 border-t border-slate-100 flex flex-col items-center space-y-4">
                            <div className="flex items-center justify-center gap-2 text-[0.85rem] font-medium text-amber-600 bg-amber-50 px-6 py-2.5 rounded-full border border-amber-100 animate-pulse w-full max-w-xs text-center">
                                <Loader2 className="animate-spin flex-shrink-0" size={16} /> Đang chờ xác nhận (1-3 phút)...
                            </div>

                            <button
                                onClick={handleManualCheck}
                                disabled={checkStatusMutation.isPending}
                                className="w-full max-w-xs flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 shadow-md"
                            >
                                {checkStatusMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                Tôi đã chuyển khoản xong
                            </button>

                            <div className="text-center pt-1">
                                <p className="text-[0.8rem] font-medium text-slate-500">
                                    Lỡ chuyển khoản sai nội dung?{' '}
                                    <button
                                        type="button"
                                        onClick={handleOpenClaim}
                                        className="text-amber-600 font-bold hover:underline transition-all"
                                    >
                                        Tra soát
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <SuspenseClaimModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
            />
        </>
    );
}
