import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDisbursementStatusStream } from '../../hooks/useDisbursementStatusStream';
import { useTransferActionMutation } from '../../hooks/useDisbursementMutations';
import { Loader2, Landmark, ShieldAlert, KeyRound, XCircle, CheckCircle2, Wifi } from 'lucide-react';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';

export function DisbursementTransferEngine({ request, paymentInfo, onCompleted }) {
    const [isManualMode, setIsManualMode] = useState(false);
    const [showFailInput, setShowFailInput] = useState(false);

    const [bankTransactionRef, setBankTransactionRef] = useState('');
    const [failReason, setFailReason] = useState('');

    const { mutate: confirmTransfer, isPending: isConfirming } = useTransferActionMutation('confirm');
    const { mutate: failTransfer, isPending: isFailing } = useTransferActionMutation('fail');

    const { connectionStatus } = useDisbursementStatusStream(request._id, (data) => {
        if (data.status === 'COMPLETED') {
            onCompleted?.();
        }
    });

    const handleManualConfirm = () => {
        if (!bankTransactionRef.trim()) return;
        confirmTransfer(
            { id: request._id, payload: { bankTransactionRef } },
            { onSuccess: onCompleted }
        );
    };

    const handleManualFail = () => {
        if (!failReason.trim()) return;
        failTransfer(
            { id: request._id, payload: { reason: failReason } },
            { onSuccess: onCompleted }
        );
    };

    const qrContent = paymentInfo?.qrUrl || request.vietQRUrl;
    const isImageUrl = qrContent?.startsWith('http');

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 relative overflow-hidden shadow-sm">
            {/* [ĐÃ FIX] Chỉ hiện Loader chặn màn hình khi ĐANG KẾT NỐI, không chặn khi ĐÃ MỞ (open) */}
            {connectionStatus === 'connecting' && !isManualMode && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
                    <p className="text-sm font-bold text-slate-700">Đang thiết lập kênh an toàn...</p>
                </div>
            )}

            <div className="mb-6 text-center z-10 w-full relative">
                {/* Live Indicator báo hiệu kết nối Auto-Listen đang chạy ngon */}
                {connectionStatus === 'open' && !isManualMode && (
                    <div className="absolute top-0 right-0 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full animate-in zoom-in-95 duration-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Auto-Listen</span>
                    </div>
                )}
                
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Quét mã QR để chuyển tiền</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                    {formatProjectCurrencyVND(request.approvedAmount)}
                </h3>
            </div>

            {/* Khu vực hiển thị mã QR Rõ nét để quét */}
            <div className="flex justify-center items-center w-full mb-8 z-10 relative">
                {isImageUrl ? (
                    <img 
                        src={qrContent} 
                        alt="Mã QR Chuyển khoản" 
                        className="w-full max-w-[280px] h-auto object-contain rounded-2xl drop-shadow-md"
                        crossOrigin="anonymous"
                        onError={(e) => { e.target.src = '/placeholder-qr.png'; }} 
                    />
                ) : (
                    <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-md">
                        <QRCodeSVG 
                            value={qrContent || ''} 
                            size={240} 
                            level="H" 
                            includeMargin={true} 
                        />
                    </div>
                )}
            </div>

            <div className="w-full flex items-center gap-3 p-4 mb-6 rounded-2xl bg-slate-50 border border-slate-100 z-10">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Landmark size={20} className="text-emerald-600" />
                </div>
                <div className="text-left overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tài khoản thụ hưởng</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{request.bankAccountSnapshot.accountName}</p>
                    <p className="text-xs font-medium text-slate-500">{request.bankAccountSnapshot.bankName} • {request.bankAccountSnapshot.accountNumber}</p>
                </div>
            </div>

            <div className="w-full space-y-4 z-10">
                {!isManualMode ? (
                    <button
                        onClick={() => setIsManualMode(true)}
                        className="w-full py-3 text-[11px] font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <Wifi size={14} /> Gặp sự cố Webhook? Xử lý thủ công
                    </button>
                ) : (
                    <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 animate-in slide-in-from-bottom-4 duration-300 shadow-inner">
                        <h4 className="text-xs font-black uppercase text-amber-600 flex items-center gap-2">
                            <ShieldAlert size={16} />
                            Chế độ xử lý thủ công (Fallback)
                        </h4>

                        {!showFailInput ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Nhập mã giao dịch (Bank Ref)..."
                                        value={bankTransactionRef}
                                        onChange={(e) => setBankTransactionRef(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-emerald-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsManualMode(false)}
                                        className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleManualConfirm}
                                        disabled={!bankTransactionRef.trim() || isConfirming}
                                        className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {isConfirming ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                        Xác nhận
                                    </button>
                                </div>
                                <div className="pt-3 border-t border-slate-200/60 text-center">
                                    <button
                                        onClick={() => setShowFailInput(true)}
                                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2"
                                    >
                                        Báo lỗi chuyển khoản (Hold lệnh)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <textarea
                                    placeholder="Nhập lý do ngân hàng lỗi..."
                                    value={failReason}
                                    onChange={(e) => setFailReason(e.target.value)}
                                    className="w-full rounded-xl border border-rose-200 bg-white py-3 px-4 text-sm font-medium outline-none focus:border-rose-500 transition-all min-h-[100px] shadow-sm"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowFailInput(false)}
                                        disabled={isFailing}
                                        className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleManualFail}
                                        disabled={!failReason.trim() || isFailing}
                                        className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {isFailing ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                        Báo lỗi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}