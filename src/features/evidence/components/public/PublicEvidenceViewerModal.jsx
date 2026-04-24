import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { usePublicEvidence } from '../../hooks/useEvidenceQueries';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { 
    Loader2, FileText, Image as ImageIcon, 
    Receipt, ZoomIn, X, Wallet, CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

export function PublicEvidenceViewerModal({ projectId, milestone, onClose }) {
    const { data: evidence, isLoading } = usePublicEvidence(projectId, milestone?.milestoneId);
    
    const [previewImg, setPreviewImg] = useState(null);

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
                                            className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in border border-slate-100"
                                            onClick={() => setPreviewImg(item.receiptMediaId?.url)}
                                        >
                                            <img 
                                                src={item.receiptMediaId?.url} 
                                                className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                                                alt="Receipt" 
                                                onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                            />
                                            <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <ZoomIn className="text-white" size={16} />
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
                                        className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in shadow-sm"
                                        onClick={() => setPreviewImg(media.url)}
                                    >
                                        <img 
                                            src={media.url} 
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                            alt="Evidence" 
                                            onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=Error'; }}
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ZoomIn className="text-white" size={24} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* LIGHTBOX PREVIEW */}
            {previewImg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 animate-in fade-in duration-200">
                    <button 
                        onClick={() => setPreviewImg(null)}
                        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:rotate-90"
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={previewImg} 
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain animate-in zoom-in-95" 
                        alt="Preview" 
                    />
                </div>
            )}
        </Modal>
    );
}