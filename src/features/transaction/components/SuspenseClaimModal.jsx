import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { useSubmitClaimMutation } from '../hooks/useSuspenseMutations';
import { useHybridUploader } from '@/shared/hooks/useHybridUploader';
import { UploadCloud, Image as ImageIcon, Loader2, X, AlertTriangle } from 'lucide-react';

const claimSchema = z.object({
    amount: z.coerce.number().min(5000, "Số tiền không hợp lệ (Tối thiểu 5.000đ)"),
    bankTransactionRef: z.string().trim().min(1, "Vui lòng nhập mã giao dịch / nội dung").max(100, "Mã quá dài"),
    proofImageUrl: z.string().url("Vui lòng tải lên hình ảnh biên lai rõ nét")
});

export function SuspenseClaimModal({ isOpen, onClose }) {
    const submitClaimMutation = useSubmitClaimMutation();
    const { upload, isUploading, cancel } = useHybridUploader();

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
        resolver: zodResolver(claimSchema),
        defaultValues: { amount: 0, bankTransactionRef: '', proofImageUrl: '' }
    });

    const watchAmount = watch('amount');
    const proofUrl = watch('proofImageUrl');
    const displayAmount = watchAmount ? watchAmount.toLocaleString('vi-VN') : '';

    const handleClose = useCallback(() => {
        cancel(); // Hủy upload nếu đang dở dang
        reset();
        onClose();
    }, [cancel, reset, onClose]);

    // Dọn dẹp an toàn khi component unmount
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (!rawValue) {
            setValue('amount', 0, { shouldValidate: true });
            return;
        }
        setValue('amount', parseInt(rawValue, 10), { shouldValidate: true });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setValue('proofImageUrl', '', { shouldValidate: true });
        
        const result = await upload(file, "suspense_receipt");
        if (result?.url) {
            setValue('proofImageUrl', result.url, { shouldValidate: true });
        }
        e.target.value = ''; // Reset input file
    };

    const onSubmit = (data) => {
        submitClaimMutation.mutate(data, {
            onSuccess: () => {
                handleClose();
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nộp biên lai tra soát">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-sm text-amber-800 mb-6">
                <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={20} />
                <p>
                    <b>Lưu ý:</b> Hệ thống sẽ quét trực tiếp với ngân hàng ngay khi bạn gửi. Quá trình này có thể mất 2-3 giây. Vui lòng không đóng cửa sổ.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Số tiền bạn đã chuyển (VNĐ)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={displayAmount}
                        onChange={handleAmountChange}
                        placeholder="VD: 50,000"
                        className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-lg font-bold tracking-wider text-slate-900 outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
                    />
                    {errors.amount && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.amount.message}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Mã giao dịch hoặc Nội dung đã chuyển</label>
                    <input
                        type="text"
                        {...register('bankTransactionRef')}
                        placeholder="VD: FT2410... hoặc DONATE ABC..."
                        className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-50 uppercase placeholder:normal-case"
                    />
                    {errors.bankTransactionRef && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.bankTransactionRef.message}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Hình ảnh biên lai chuyển khoản</label>
                    
                    {proofUrl ? (
                        <div className="relative rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-2 h-40 flex items-center justify-center overflow-hidden">
                            <img src={proofUrl} alt="Biên lai" className="object-contain h-full w-full rounded-xl" />
                            <button
                                type="button"
                                onClick={() => setValue('proofImageUrl', '', { shouldValidate: true })}
                                className="absolute top-3 right-3 bg-white text-rose-500 p-2 rounded-full shadow-md hover:bg-rose-50 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed h-40 cursor-pointer transition-all ${isUploading ? 'border-amber-300 bg-amber-50 opacity-70 cursor-not-allowed' : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/30'}`}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
                                    <span className="text-sm font-bold text-amber-700">Đang tải ảnh lên (Bảo mật)...</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                        <UploadCloud className="text-amber-500" size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">Nhấn để chọn biên lai</span>
                                    <span className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG (Max 5MB)</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                className="hidden"
                                disabled={isUploading}
                                onChange={handleFileChange}
                            />
                        </label>
                    )}
                    {errors.proofImageUrl && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.proofImageUrl.message}</p>}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={submitClaimMutation.isPending || isUploading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                    >
                        {submitClaimMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                        {submitClaimMutation.isPending ? 'Đang gửi & Đồng bộ ngân hàng...' : 'Gửi yêu cầu tra soát'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}