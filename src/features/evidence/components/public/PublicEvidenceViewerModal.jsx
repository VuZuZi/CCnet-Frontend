import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { usePublicEvidence } from '../../hooks/useEvidenceQueries';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { 
    Loader2, FileText, Image as ImageIcon, 
    Receipt, ZoomIn, X, Wallet, CheckCircle2, Download
} from 'lucide-react';

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
        console.error('[PublicEvidenceViewerModal] Tải tệp thất bại', err);
    }
};

export function PublicEvidenceViewerModal({ projectId, milestone, onClose }) {
    const { data: evidence, isLoading } = usePublicEvidence(projectId, milestone?.milestoneId);
    
    const [previewMedia, setPreviewMedia] = useState(null);

    // 1. Guard Clause: Loading
    if (isLoading) return (
        <Modal open onClose={onClose} title="Đang tải dữ liệu..." maxWidth="max-w-md">
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-xs font-bold text-slate-400 animate-pulse">Đang trích xuất sổ cái minh bạch...</p>
            </div>
        </Modal>
    );
    
    // 2. Guard Clause: No Data
    if (!evidence) return null;

    // 3. Safe Data Computation
    const { financialContext, financialReport, evidenceImages = [], reportContent, submittedAt } = evidence;
    const hasFinancialData = !!financialContext && !!financialReport;
    const expenseItems = financialReport?.expenseItems || [];

    return (
        <Modal open onClose={onClose} title={`Báo cáo: ${milestone?.title || 'Giai đoạn'}`} maxWidth="max-w-4xl">
            <div className="space-y-8 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
                
                {/* 1. BANNER TÀI CHÍNH TỔNG QUAN (Chỉ hiện cho dự án FUNDED) */}
                {hasFinancialData && (
                    <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                            <CheckCircle2 size={120} />
                        </div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    <Wallet size={12} /> Tổng quỹ phân bổ
                                </p>
                                <p className="text-2xl font-black text-white">
                                    {formatProjectCurrencyVND(financialContext.totalAvailable)}
                                </p>
                                {financialContext.rolloverFromPrevious > 0 && (
                                    <p className="text-[10px] text-emerald-400 mt-1 font-medium">
                                        + {formatProjectCurrencyVND(financialContext.rolloverFromPrevious)} kết dư từ mốc trước
                                    </p>
                                )}
                            </div>
                            <div className="md:border-l md:border-white/10 md:pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Thực chi hợp lệ</p>
                                <p className="text-2xl font-black text-emerald-400">
                                    {formatProjectCurrencyVND(financialContext.approvedSpentAmount)}
                                </p>
                            </div>
                            <div className="md:border-l md:border-white/10 md:pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Kết dư / Hoàn trả</p>
                                <p className="text-2xl font-black text-amber-400">
                                    {formatProjectCurrencyVND(financialReport.unspentAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. NỘI DUNG BÁO CÁO */}
                <section className="space-y-3">
                    <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                        <FileText size={14} className="text-slate-400" /> Báo cáo tóm tắt
                    </h4>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-sm leading-relaxed text-slate-700 shadow-inner">
                        {reportContent || "Không có nội dung giải trình."}
                    </div>
                    {submittedAt && (
                        <p className="text-[10px] text-slate-400 font-medium italic pl-1">
                            Nộp lúc: {new Date(submittedAt).toLocaleString('vi-VN')}
                        </p>
                    )}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 3. CHỨNG TỪ & HÓA ĐƠN */}
                    {hasFinancialData && (
                        <section className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                                <Receipt size={14} className="text-slate-400" /> Chứng từ & Hóa đơn ({expenseItems.length})
                            </h4>
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {expenseItems.length > 0 ? expenseItems.map((item, idx) => (
                                    <div key={idx} className="group flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 transition-all shadow-sm">
                                        <div
                                            className={`relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 ${isImageMedia(item.receiptMediaId) ? 'cursor-zoom-in' : ''}`}
                                            onClick={() => {
                                                if (isImageMedia(item.receiptMediaId)) setPreviewMedia(item.receiptMediaId);
                                            }}
                                        >
                                            {isImageMedia(item.receiptMediaId) ? (
                                                <img
                                                    src={getMediaUrl(item.receiptMediaId)}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                    alt={getMediaName(item.receiptMediaId)}
                                                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-500">
                                                    <FileText size={24} className={isPdfMedia(item.receiptMediaId) ? "text-red-500" : "text-slate-500"} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                {isImageMedia(item.receiptMediaId) ? <ZoomIn className="text-white" size={16} /> : <Download className="text-white" size={16} />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
                                                    {item.itemName || 'Chi phí chung'}
                                                </p>
                                                {item.amount > 0 && (
                                                    <p className="font-black text-emerald-600 text-sm shrink-0">
                                                        {formatProjectCurrencyVND(item.amount)}
                                                    </p>
                                                )}
                                            </div>
                                            {item.note && <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.note}</p>}
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
                                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs italic">
                                        Không có tệp đính kèm.
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 4. ẢNH THỰC ĐỊA */}
                    {evidenceImages.length > 0 && (
                        <section className="space-y-4">
                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                                <ImageIcon size={14} className="text-slate-400" /> Ảnh chụp thực địa ({evidenceImages.length})
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {evidenceImages.map((media, idx) => (
                                    <div
                                        key={media._id || idx}
                                        className={`group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm ${isImageMedia(media) ? 'cursor-zoom-in' : ''}`}
                                        onClick={() => {
                                            if (isImageMedia(media)) setPreviewMedia(media);
                                        }}
                                    >
                                        {isImageMedia(media) ? (
                                            <img
                                                src={getMediaUrl(media)}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                alt={getMediaName(media)}
                                                onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=Error'; }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-slate-500">
                                                <FileText size={26} className={isPdfMedia(media) ? "text-red-500" : "text-slate-500"} />
                                                <span className="line-clamp-2 text-[10px] font-bold">{getDocumentLabel(media)}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            {isImageMedia(media) ? <ZoomIn className="text-white" size={24} /> : <Download className="text-white" size={24} />}
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
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
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
