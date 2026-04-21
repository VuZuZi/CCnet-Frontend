import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { DisbursementTransferEngine } from './DisbursementTransferEngine';
import { useDisbursementDetail } from '../../hooks/useDisbursementQueries';
import { useApproveDisbursementMutation } from '../../hooks/useDisbursementMutations';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { ShieldCheck, XCircle, Loader2, Info, FileText } from 'lucide-react';
import clsx from 'clsx';

export function AdminDisbursementReviewModal({ requestId, onClose }) {
    // Đã đổi alias để không bị nhầm lẫn giữa API Envelope và Object thực tế
    const { data: responseData, isLoading } = useDisbursementDetail(requestId);
    const { mutate: approve, isPending } = useApproveDisbursementMutation();
    const [note, setNote] = useState('');

    if (isLoading) {
        return (
            <Modal open onClose={onClose} title="Xử lý yêu cầu giải ngân">
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
            </Modal>
        );
    }

    // Bóc tách chính xác lớp "request" từ API Envelope, fallback dự phòng nếu BE đổi cấu trúc
    const request = responseData?.request || responseData;
    const paymentInfo = responseData?.paymentInfo; // [BỔ SUNG] Bóc tách paymentInfo

    if (!request) return null;

    const handleAction = (decision) => {
        approve({ id: requestId, payload: { decision, note } });
    };

    // Phân rã State an toàn (Optional Chaining)
    const currentStatus = request?.status || 'UNKNOWN';
    const isPendingStatus = currentStatus === 'PENDING';
    const isPendingTransfer = currentStatus === 'APPROVED_PENDING_TRANSFER';
    const isCompleted = currentStatus === 'COMPLETED';

    return (
        <Modal open onClose={onClose} title="Xử lý yêu cầu giải ngân" size="max-w-2xl">
            <div className="space-y-6">

                {/* Header: Thông tin tóm tắt luôn hiện */}
                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số tiền yêu cầu rút</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{formatProjectCurrencyVND(request?.requestedAmount)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái Sổ cái</p>
                        <span className={clsx(
                            "inline-block mt-1 px-3 py-1 rounded-lg text-xs font-black uppercase",
                            isPendingStatus ? "bg-amber-100 text-amber-700" :
                                isPendingTransfer ? "bg-blue-100 text-blue-700" :
                                    isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        )}>
                            {/* Bọc Optional Chaining cho hàm replace để chống Crash tuyệt đối */}
                            {currentStatus.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>

                {/* --- STATE 1: ĐANG CHỜ DUYỆT (PENDING) --- */}
                {isPendingStatus && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100 flex gap-3">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                Vui lòng kiểm tra số tiền khớp với Lộ trình trước khi duyệt. Sau khi <strong>Phê duyệt lệnh</strong>, hệ thống sẽ mở khóa mã QR để Kế toán tiến hành chuyển khoản thật.
                            </p>
                        </div>

                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                            <textarea
                                placeholder="Ghi chú phản hồi cho Organizer (Bắt buộc nhập nếu Từ chối lệnh)..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 py-4 pr-4 pl-12 text-sm min-h-[100px] focus:border-slate-900 focus:bg-slate-50 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => handleAction('REJECTED')}
                                disabled={isPending || (!note.trim())}
                                className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 text-sm font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
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
                            paymentInfo={paymentInfo} // [BỔ SUNG] Truyền prop này xuống
                            onCompleted={onClose}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}