import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { HybridMediaDropzone } from '@/shared/components/ui/HybridMediaDropzone';
import { useSubmitEvidenceMutation } from '../hooks/useEvidenceMutations';
import { evidenceSubmitSchema } from '../validations/evidenceSchema';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { useToast } from '@/shared/contexts/ToastContext';
import { Info } from 'lucide-react';

export function SubmitEvidenceModal({ project, milestone, onClose, submissionMode = 'MANUAL_UPLOAD' }) {
    const { mutate: submit, isPending } = useSubmitEvidenceMutation();
    const toast = useToast();
    const isFinancialMilestone = Number(milestone?.targetAmount || 0) > 0;
    const requiresFinancial = project.projectType === 'FUNDED' && isFinancialMilestone;
    const evidenceSubmissionMode = requiresFinancial ? 'MANUAL_UPLOAD' : submissionMode;

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(evidenceSubmitSchema),
        defaultValues: { mediaIds: [], receiptMediaIds: [], spentAmount: '', submissionMode: evidenceSubmissionMode }
    });

    const [fullMedias, setFullMedias] = useState([]);
    const [fullReceipts, setFullReceipts] = useState([]);

    const handleMediaChange = (newMedias) => {
        setFullMedias(newMedias);
        setValue('mediaIds', newMedias.map(m => m.id), { shouldValidate: true });
    };

    const handleReceiptChange = (newReceipts) => {
        setFullReceipts(newReceipts);
        setValue('receiptMediaIds', newReceipts.map(m => m.id), { shouldValidate: true });
    };

    const onSubmit = (data) => {
        // Validation Động (Dynamic Validation) tùy thuộc loại Mốc
        if (requiresFinancial && fullReceipts.length === 0) {
            return toast.error("Bắt buộc tải lên ít nhất 1 hóa đơn/chứng từ thanh toán.");
        }
        if (!requiresFinancial && fullMedias.length === 0) {
            return toast.error("Bắt buộc tải lên ít nhất 1 ảnh thực địa.");
        }

        const payload = {
            ...data,
            submissionMode: evidenceSubmissionMode,
            projectId: project._id,
            milestoneId: milestone.milestoneId
        };
        
        if (!requiresFinancial) {
            delete payload.spentAmount;
            delete payload.receiptMediaIds;
        }

        submit(payload, { onSuccess: onClose });
    };

    return (
        <Modal open onClose={onClose} title="Báo cáo nghiệm thu giai đoạn" size="max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* NHÁNH 1: MỐC CÓ NGÂN SÁCH (>0Đ) */}
                {requiresFinancial ? (
                    <>
                        <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100 flex gap-3">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-blue-900">Khai báo tổng chi tiêu</p>
                                <p className="text-[11px] text-blue-800 leading-relaxed">
                                    Ngân sách mốc: <strong>{formatProjectCurrencyVND(milestone.targetAmount)}</strong>. 
                                    Bạn chỉ cần nhập tổng tiền và tải hóa đơn lên.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-900">
                                1. Tổng số tiền đã sử dụng (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register('spentAmount')}
                                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="Ví dụ: 15000000"
                            />
                            {errors.spentAmount && <p className="text-[10px] text-red-500 font-bold">{errors.spentAmount.message}</p>}
                        </div>

                        <div className="space-y-2 border-t border-slate-100 pt-6">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2 block">
                                2. Hóa đơn / Chứng từ thanh toán <span className="text-red-500">*</span>
                            </label>
                            <HybridMediaDropzone
                                value={fullReceipts}
                                onChange={handleReceiptChange}
                                context="project_receipt"
                                mode="upload_only" // Chế độ chỉ upload file, không hiện rác Camera GPS
                            />
                        </div>
                    </>
                ) : (
                    /* NHÁNH 2: MỐC KHÔNG NGÂN SÁCH (0Đ) */
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2 block">
                                1. Ảnh thực địa tại dự án <span className="text-red-500">*</span>
                            </label>
                            <HybridMediaDropzone
                                value={fullMedias}
                                onChange={handleMediaChange}
                                context="milestone_evidence"
                                mode={evidenceSubmissionMode === 'GPS_CHECKIN' ? 'camera_only' : 'upload_only'}
                            />
                        </div>
                    </>
                )}

                {/* LUÔN HIỂN THỊ TEXTAREA GIẢI TRÌNH Ở CUỐI */}
                <div className="space-y-2 border-t border-slate-100 pt-6">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-900">
                        {requiresFinancial ? '3.' : '2.'} Nội dung giải trình <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        {...register('reportContent')}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-slate-900 outline-none"
                        placeholder="Mô tả tóm tắt các hoạt động đã thực hiện..."
                    />
                    {errors.reportContent && <p className="text-[10px] text-red-500 font-bold">{errors.reportContent.message}</p>}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Hủy</button>
                    <button type="submit" disabled={isPending} className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors">
                        {isPending ? "Đang gửi..." : "Xác nhận nộp báo cáo"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
