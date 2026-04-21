import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { EvidenceMap } from '@/shared/components/ui/EvidenceMap';
import { useEvidenceDetail } from '../../hooks/useEvidenceQueries';
import { useReviewEvidenceMutation } from '../../hooks/useEvidenceMutations';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { Loader2, ShieldCheck, AlertTriangle, FileText, Map as MapIcon } from 'lucide-react';
import clsx from 'clsx';

export function AdminEvidenceReviewModal({ evidenceId, onClose }) {
    const { data: evidence, isLoading } = useEvidenceDetail(evidenceId);
    const { mutate: review, isPending } = useReviewEvidenceMutation();
    const [reviewNotes, setReviewNotes] = useState('');
    const [decision, setDecision] = useState(null);

    if (isLoading) return <Modal open onClose={onClose}><div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div></Modal>;
    if (!evidence) return null;

    const handleConfirm = () => {
        if (!decision) return;
        if ((decision === 'REJECTED' || decision === 'REVISION_REQUESTED') && !reviewNotes) return;

        review({
            id: evidenceId,
            payload: { status: decision, reviewNotes }
        }, {
            onSuccess: onClose
        });
    };

    return (
        <Modal open onClose={onClose} title="Kiểm duyệt báo cáo nghiệm thu" size="max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-7 space-y-6 overflow-y-auto max-h-[75vh] pr-2">
                    <div className="rounded-2xl bg-slate-900 p-5 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quyết toán giai đoạn</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <h3 className="text-2xl font-black">{formatProjectCurrencyVND(evidence.financialReport?.spentAmount || 0)}</h3>
                            <span className="text-xs text-slate-400">/ Ngân sách mốc {formatProjectCurrencyVND(evidence.financialReport?.targetAmount || 0)}</span>
                        </div>
                    </div>

                    <section className="space-y-2">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                            <FileText size={16} className="text-slate-400" /> Nội dung báo cáo
                        </h4>
                        <div className="rounded-2xl bg-white border border-slate-200 p-4 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                            {evidence.reportContent}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-900">Hình ảnh bằng chứng ({evidence.mediaIds?.length || 0})</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {evidence.mediaIds?.map((media) => (
                                <div key={media._id} className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                    <img src={media.url} className="h-full w-full object-cover" alt="Evidence" />
                                    {media.captureMetadata?.location && (
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-black text-white">
                                            <MapIcon size={10} /> GPS VERIFIED
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="h-[250px] lg:flex-1">
                        <EvidenceMap markers={evidence.mediaIds} />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900">Quyết định kiểm duyệt</h4>

                        <div className="flex flex-wrap gap-2">
                            {['APPROVED', 'REVISION_REQUESTED', 'REJECTED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setDecision(status)}
                                    className={clsx(
                                        "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                                        decision === status
                                            ? status === 'APPROVED' ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                                                status === 'REJECTED' ? "border-red-500 bg-red-50 text-red-700" :
                                                    "border-amber-500 bg-amber-50 text-amber-700"
                                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                    )}
                                >
                                    {status === 'APPROVED' ? 'Chấp nhận' : status === 'REJECTED' ? 'Từ chối' : 'Yêu cầu sửa'}
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Ghi chú phản hồi cho Organizer (bắt buộc nếu từ chối hoặc yêu cầu sửa)..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs min-h-[80px] outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />

                        <button
                            onClick={handleConfirm}
                            disabled={isPending || !decision || ((decision !== 'APPROVED') && !reviewNotes)}
                            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                            Xác nhận quyết định
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}