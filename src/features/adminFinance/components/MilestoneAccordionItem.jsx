import React, { useState } from 'react';
import { ChevronDown, FileText, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import clsx from 'clsx';

export function MilestoneAccordionItem({ milestone, onReviewEvidence, onReviewDisbursement }) {
    const [isOpen, setIsOpen] = useState(false);
    const { title, targetAmount, status, evidences = [], disbursementRequests = [] } = milestone;

    return (
        <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm transition-all hover:border-slate-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "h-10 w-10 rounded-2xl flex items-center justify-center",
                        status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                    )}>
                        {status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">{title}</h4>
                        <p className="text-xs text-slate-500">Ngân sách mốc: {formatProjectCurrencyVND(targetAmount)}</p>
                    </div>
                </div>
                <ChevronDown className={clsx("transition-transform duration-300 text-slate-400", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <FileText size={12} /> Báo cáo nghiệm thu ({evidences.length})
                        </h5>
                        {evidences.length > 0 ? evidences.map(ev => (
                            <div key={ev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <div className="min-w-0 pr-4">
                                    <p className="text-xs font-bold text-slate-900 truncate">{ev.reportContent}</p>
                                    <span className="text-[9px] font-black uppercase text-slate-400">{ev.status}</span>
                                </div>
                                <button
                                    onClick={() => onReviewEvidence(ev._id)}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                >
                                    Review
                                </button>
                            </div>
                        )) : <p className="text-xs italic text-slate-400 p-4">Chưa có bằng chứng nào.</p>}
                    </div>

                    <div className="space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Wallet size={12} /> Lệnh giải ngân ({disbursementRequests.length})
                        </h5>
                        {disbursementRequests.length > 0 ? disbursementRequests.map(req => (
                            <div key={req._id} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-blue-900">{formatProjectCurrencyVND(req.requestedAmount)}</p>
                                    <span className="text-[9px] font-black uppercase text-blue-500">{req.status}</span>
                                </div>
                                <button
                                    onClick={() => onReviewDisbursement(req._id)}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-[10px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    Xử lý tiền
                                </button>
                            </div>
                        )) : <p className="text-xs italic text-slate-400 p-4">Chưa có yêu cầu rút tiền.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}