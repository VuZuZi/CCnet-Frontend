import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { EvidenceMap } from '@/shared/components/ui/EvidenceMap';
import { useEvidenceDetail } from '../../hooks/useEvidenceQueries';
import { useReviewEvidenceMutation } from '../../hooks/useEvidenceMutations';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { 
    Loader2, ShieldCheck, FileText, Map as MapIcon, 
    Receipt, ZoomIn, X, Clock, Download
} from 'lucide-react';
import clsx from 'clsx';

const getMediaUrl = (media) => media?.url || media?.secure_url || '';
const getMediaName = (media) => media?.originalName || media?.fileName || media?.name || 'Tệp đính kèm';
const getMediaMime = (media) => String(media?.mimetype || media?.mimeType || '').toLowerCase();
const getMediaExtension = (media) => {
    const name = getMediaName(media).toLowerCase();
    const url = getMediaUrl(media).toLowerCase().split('?')[0];
    const match = `${name} ${url}`.match(/\.([a-z0-9]+)(?:\s|$)/);
    return match?.[1] || '';
};
const isImageMedia = (media) => {
    const mime = getMediaMime(media);
    if (mime.startsWith('image/')) return true;
    if (getMediaUrl(media).toLowerCase().includes('/image/upload')) return true;
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(getMediaExtension(media));
};
const isPdfMedia = (media) => getMediaMime(media).includes('application/pdf') || getMediaExtension(media) === 'pdf';
const getDocumentLabel = (media) => {
    if (isPdfMedia(media)) return 'Tài liệu PDF';
    const ext = getMediaExtension(media);
    if (['doc', 'docx'].includes(ext)) return 'Tài liệu Word';
    if (['xls', 'xlsx'].includes(ext)) return 'Bảng tính Excel';
    if (['ppt', 'pptx'].includes(ext)) return 'Tệp trình chiếu';
    if (ext === 'txt') return 'Tệp văn bản';
    return 'Tệp đính kèm';
};
const downloadFile = async (url, fileName) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName || 'tep-dinh-kem';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
    } catch (err) {
        console.error('[AdminEvidenceReviewModal] Tải tệp thất bại', err);
    }
};

export function AdminEvidenceReviewModal({ evidenceId, onClose }) {
    const { data: evidence, isLoading } = useEvidenceDetail(evidenceId);
    const { mutate: review, isPending } = useReviewEvidenceMutation();
    
    const [reviewNotes, setReviewNotes] = useState('');
    const [decision, setDecision] = useState(null);
    const [previewMedia, setPreviewMedia] = useState(null);

    // 1. Guard Clause: Loading
    if (isLoading) return (
        <Modal open onClose={onClose} title="Đang tải..." maxWidth="max-w-md">
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
        </Modal>
    );
    
    // 2. Guard Clause: No Data
    if (!evidence) return null;

    // 3. Safe Data Computation
    const milestones = evidence.projectId?.milestones || [];
    const currentMilestone = milestones.find(m => m.milestoneId === evidence.milestoneId);
    const targetAmount = currentMilestone?.targetAmount || 0;
    
    const hasFinancialReport = !!evidence.financialReport;
    const expenseItems = evidence.financialReport?.expenseItems || [];
    
    // Check trạng thái chờ duyệt (Chỉ PENDING mới cho thao tác Form)
    const isPendingReview = evidence.status === 'PENDING';

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
        <Modal open onClose={onClose} title="Kiểm duyệt báo cáo nghiệm thu" maxWidth="max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* CỘT TRÁI: DỮ LIỆU BẰNG CHỨNG */}
                <div className="lg:col-span-7 space-y-8 overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar">
                    
                    {/* Banner Tài chính */}
                    <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl ring-1 ring-white/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thực chi nộp duyệt</p>
                                <h3 className="mt-1 text-3xl font-black text-emerald-400">
                                    {formatProjectCurrencyVND(evidence.financialReport?.spentAmount || 0)}
                                </h3>
                            </div>
                            <div className="text-right border-l border-white/10 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngân sách mốc</p>
                                <p className="mt-1 text-lg font-bold text-slate-100">{formatProjectCurrencyVND(targetAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung giải trình */}
                    <section className="space-y-3">
                        <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                            <FileText size={14} className="text-slate-400" /> Báo cáo tóm tắt
                        </h4>
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-sm leading-relaxed text-slate-700">
                            {evidence.reportContent || "Không có nội dung giải trình."}
                        </div>
                    </section>

                    {/* Danh sách Hóa đơn */}
                    {hasFinancialReport && (
                        <section className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                                <Receipt size={14} className="text-slate-400" /> Chứng từ & Hóa đơn chi tiết
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {expenseItems.length > 0 ? expenseItems.map((item, idx) => (
                                    <div key={idx} className="group flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all">
                                        <div
                                            className={clsx(
                                                "relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100",
                                                isImageMedia(item.receiptMediaId) && "cursor-zoom-in"
                                            )}
                                            onClick={() => {
                                                if (isImageMedia(item.receiptMediaId)) setPreviewMedia(item.receiptMediaId);
                                            }}
                                        >
                                            {isImageMedia(item.receiptMediaId) ? (
                                                <img
                                                    src={getMediaUrl(item.receiptMediaId)}
                                                    className="h-full w-full object-cover"
                                                    alt={getMediaName(item.receiptMediaId)}
                                                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-500">
                                                    <FileText size={24} className={isPdfMedia(item.receiptMediaId) ? "text-red-500" : "text-slate-500"} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                {isImageMedia(item.receiptMediaId) ? <ZoomIn className="text-white" size={16} /> : <Download className="text-white" size={16} />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-slate-900 truncate text-sm">{item.itemName || 'Chi phí chung'}</p>
                                                {/* FIX: Chỉ hiển thị số tiền nếu amount > 0 để tránh nhiễu 0đ */}
                                                {item.amount > 0 && (
                                                    <p className="font-black text-slate-900 text-sm">{formatProjectCurrencyVND(item.amount)}</p>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">{item.note || 'Chứng từ hợp lệ'}</p>
                                            {!isImageMedia(item.receiptMediaId) && getMediaUrl(item.receiptMediaId) && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        downloadFile(getMediaUrl(item.receiptMediaId), getMediaName(item.receiptMediaId));
                                                    }}
                                                    className="mt-2 inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-amber-50"
                                                >
                                                    <Download size={12} />
                                                    Tải xuống
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs italic">
                                        Không có tệp hóa đơn đính kèm chi tiết.
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Hình ảnh hiện trường */}
                    {evidence.mediaIds?.length > 0 && (
                        <section className="space-y-3 pt-2">
                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                                <MapIcon size={14} className="text-slate-400" /> Ảnh chụp thực địa
                            </h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {evidence.mediaIds.map((media) => (
                                    <div
                                        key={media._id}
                                        className={clsx(
                                            "group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm",
                                            isImageMedia(media) && "cursor-zoom-in"
                                        )}
                                        onClick={() => {
                                            if (isImageMedia(media)) setPreviewMedia(media);
                                        }}
                                    >
                                        {isImageMedia(media) ? (
                                            <img src={getMediaUrl(media)} className="h-full w-full object-cover" alt={getMediaName(media)} />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-slate-500">
                                                <FileText size={24} className={isPdfMedia(media) ? "text-red-500" : "text-slate-500"} />
                                                <span className="line-clamp-2 text-[9px] font-bold">{getDocumentLabel(media)}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            {isImageMedia(media) ? <ZoomIn className="text-white" size={20} /> : <Download className="text-white" size={20} />}
                                        </div>
                                        {!isImageMedia(media) && getMediaUrl(media) && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    downloadFile(getMediaUrl(media), getMediaName(media));
                                                }}
                                                className="absolute bottom-2 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm hover:bg-amber-50"
                                            >
                                                <Download size={11} />
                                                Tải xuống
                                            </button>
                                        )}
                                        {(media.captureMetadata?.lat !== null && media.captureMetadata?.lng !== null) && (
                                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[7px] font-black text-white uppercase tracking-tighter">
                                                GPS OK
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* CỘT PHẢI: BẢN ĐỒ & QUYẾT ĐỊNH / KẾT QUẢ */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="h-[280px] rounded-[32px] overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative">
                        <EvidenceMap markers={evidence.mediaIds} />
                    </div>

                    <div className="rounded-[32px] border border-slate-200 bg-white p-6 space-y-6 shadow-xl shadow-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
                                {isPendingReview ? "Thao tác kiểm duyệt" : "Kết quả kiểm duyệt"}
                            </h4>
                            <span className={clsx("flex h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]",
                                evidence.status === 'APPROVED' ? "bg-emerald-500 text-emerald-500" :
                                evidence.status === 'REJECTED' ? "bg-red-500 text-red-500" :
                                evidence.status === 'REVISION_REQUESTED' ? "bg-amber-500 text-amber-500" :
                                "bg-blue-500 text-blue-500"
                            )} />
                        </div>

                        {isPendingReview ? (
                            /* --- MODE 1: CHỜ DUYỆT (FORM TƯƠNG TÁC) --- */
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="grid grid-cols-1 gap-2">
                                    {['APPROVED', 'REVISION_REQUESTED', 'REJECTED'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setDecision(status)}
                                            className={clsx(
                                                "w-full px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-between",
                                                decision === status
                                                    ? status === 'APPROVED' ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                                                      status === 'REJECTED' ? "border-red-500 bg-red-50 text-red-700" :
                                                      "border-amber-500 bg-amber-50 text-amber-700"
                                                    : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-100"
                                            )}
                                        >
                                            <span>{status === 'APPROVED' ? 'Chấp thuận' : status === 'REJECTED' ? 'Từ chối' : 'Yêu cầu sửa'}</span>
                                            {decision === status && <ShieldCheck size={14} />}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Lý do phản hồi</label>
                                    <textarea
                                        placeholder="Nhập lý do chi tiết cho tổ chức..."
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs min-h-[100px] outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    disabled={isPending || !decision || (decision !== 'APPROVED' && !reviewNotes)}
                                    className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50 transition-all transform active:scale-95 shadow-lg shadow-slate-200"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={18} /> : "Xác nhận & Cập nhật trạng thái"}
                                </button>
                            </div>
                        ) : (
                            /* --- MODE 2: ĐÃ DUYỆT (VIEW ONLY) --- */
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div className={clsx(
                                    "p-4 rounded-2xl border",
                                    evidence.status === 'APPROVED' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                    evidence.status === 'REJECTED' ? "bg-red-50 border-red-100 text-red-700" :
                                    "bg-amber-50 border-amber-100 text-amber-700"
                                )}>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Quyết định cuối cùng</p>
                                    <p className="font-bold text-sm">
                                        {evidence.status === 'APPROVED' ? 'Đã chấp thuận báo cáo' :
                                         evidence.status === 'REJECTED' ? 'Từ chối báo cáo' : 'Đã yêu cầu chỉnh sửa lại'}
                                    </p>
                                </div>

                                {evidence.reviewNotes && (
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">
                                            Ghi chú từ quản trị viên
                                        </label>
                                        <div className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 shadow-inner">
                                            {evidence.reviewNotes}
                                        </div>
                                    </div>
                                )}

                                {evidence.reviewedAt && (
                                    <div className="flex items-center gap-2 text-slate-400 border-t border-slate-100 pt-4">
                                        <Clock size={14} />
                                        <p className="text-[10px] font-medium uppercase tracking-widest">
                                            Thời gian duyệt: {new Date(evidence.reviewedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LIGHTBOX PREVIEW */}
            {previewMedia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 animate-in fade-in duration-200">
                    <button 
                        onClick={() => setPreviewMedia(null)}
                        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:rotate-90"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={getMediaUrl(previewMedia)}
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain animate-in zoom-in-95"
                        alt={getMediaName(previewMedia)}
                    />

                </div>
            )}
        </Modal>
    );
}
