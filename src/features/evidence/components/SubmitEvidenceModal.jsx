import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { HybridMediaDropzone } from '@/shared/components/ui/HybridMediaDropzone';
import { useSubmitEvidenceMutation, useUpdateEvidenceMutation } from '../hooks/useEvidenceMutations';
import { evidenceSubmitSchema, evidenceUpdateSchema } from '../validations/evidenceSchema';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { AlertCircle, Send, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

export function SubmitEvidenceModal({ projectId, milestone, onClose }) {
    const { mutate: submit, isPending } = useSubmitEvidenceMutation();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(evidenceSubmitSchema),
        defaultValues: { mediaIds: [], receiptMediaIds: [] }
    });

    const currentMediaIds = watch('mediaIds');
    const currentReceiptIds = watch('receiptMediaIds');

    return (
        <Modal open onClose={onClose} title="Nộp báo cáo nghiệm thu & Hóa đơn" size="max-w-2xl">
            <form onSubmit={handleSubmit((data) => submit({ ...data, projectId, milestoneId: milestone.milestoneId }, { onSuccess: onClose }))} className="space-y-6">
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-900">1. Ảnh thực địa (Bắt buộc)</label>
                    <HybridMediaDropzone
                        value={currentMediaIds.map(id => ({ id }))}
                        onChange={(medias) => setValue('mediaIds', medias.map(m => m.id))}
                        context="project_evidence"
                    />
                    {errors.mediaIds && <p className="text-[10px] text-red-500 font-bold">{errors.mediaIds.message}</p>}

                    <label className="text-xs font-black uppercase tracking-widest text-slate-900">2. Hóa đơn & Chứng từ chi tiêu (Nếu có)</label>
                    <HybridMediaDropzone
                        value={currentReceiptIds.map(id => ({ id }))}
                        onChange={(medias) => setValue('receiptMediaIds', medias.map(m => m.id))}
                        context="project_receipt"
                        requireCamera={false}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-900">3. Nội dung giải trình</label>
                    <textarea
                        {...register('reportContent')}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-slate-900 outline-none"
                        placeholder="Mô tả chi tiết công việc đã thực hiện..."
                    />
                    {errors.reportContent && <p className="text-[10px] text-red-500 font-bold">{errors.reportContent.message}</p>}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600">Hủy</button>
                    <button type="submit" disabled={isPending} className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50">
                        {isPending ? "Đang gửi..." : "Xác nhận nộp báo cáo"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}