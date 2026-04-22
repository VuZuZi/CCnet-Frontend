import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { DisbursementTransferEngine } from './DisbursementTransferEngine';
import { useDisbursementDetail } from '../../hooks/useDisbursementQueries';
import { useApproveDisbursementMutation } from '../../hooks/useDisbursementMutations';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { ShieldCheck, XCircle, Loader2, Info, FileText } from 'lucide-react';
import clsx from 'clsx';

// Thêm onSuccess vào props
export function AdminDisbursementReviewModal({ requestId, onClose, onSuccess }) {
    const { data: responseData, isLoading } = useDisbursementDetail(requestId);
    
    // Inject options vào mutation để gọi callback khi approve thành công
    const { mutate: approve, isPending } = useApproveDisbursementMutation({
        onSuccess: () => {
            if (onSuccess) onSuccess();
        }
    });
    
    const [note, setNote] = useState('');

    if (isLoading) {
        return (
            <Modal open onClose={onClose} title="Xử lý yêu cầu giải ngân">
                <div className="p-20 flex justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                </div>
            </Modal>
        );
    }

    const request = responseData?.request || responseData;
    const paymentInfo = responseData?.paymentInfo;

    if (!request) return null;

    const isPendingApproval = request.status === 'PENDING';
    const isPendingTransfer = request.status === 'APPROVED_PENDING_TRANSFER';
    const isCompleted = request.status === 'COMPLETED';

    const handleAction = (decision) => {
        approve(
            { id: request._id, payload: { decision, note } },
            {
                onSuccess: () => {
                    // Nếu Reject thì đóng modal luôn, nếu Approve thì để Modal hiện QR
                    if (decision === 'REJECTED') {
                        onClose();
                    }
                }
            }
        );
    };

    return (
        <Modal open onClose={onClose} title="Xử lý yêu cầu giải ngân" size="max-w-2xl">
            <div className="space-y-6">
                
                {/* THÔNG TIN YÊU CẦU */}
                <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <FileText size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Thông tin yêu cầu</span>
                        </div>
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                            isPendingApproval ? "bg-amber-100 text-amber-700" : 
                            isCompleted ? "bg-emerald-100 text-emerald-700" :
                            isPendingTransfer ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                        )}>
                            {request.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{formatProjectCurrencyVND(request.requestedAmount)}</h3>
                    <p className="text-sm text-slate-500 mt-1">{request.reason}</p>
                </div>

                {/* --- STATE 1: CHỜ DUYỆT --- */}
                {isPendingApproval && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ghi chú phê duyệt (nếu có)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập lý do từ chối hoặc lưu ý cho lệnh chuyển tiền..."
                                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none min-h-[100px] shadow-sm transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAction('REJECTED')}
                                disabled={isPending || (!note.trim())} // Vẫn giữ rule khóa nút Reject nếu chưa nhập Note
                                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
                            >
                                <XCircle size={18} /> Từ chối lệnh
                            </button>
                            <button
                                onClick={() => handleAction('APPROVED')}
                                disabled={isPending}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isPending ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                                Phê duyệt lệnh
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STATE 2 & 3: ĐÃ DUYỆT -> HIỆN QR CODE / HOÀN THÀNH --- */}
                {(isPendingTransfer || isCompleted) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DisbursementTransferEngine
                            request={request}
                            paymentInfo={paymentInfo}
                            onCompleted={() => {
                                // Gọi onSuccess của cha trước để trigger refetch data
                                if (onSuccess) onSuccess();
                                // Sau đó mới đóng modal
                                onClose();
                            }}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}