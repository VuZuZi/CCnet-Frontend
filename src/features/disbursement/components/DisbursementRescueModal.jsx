import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { useBankAccounts } from '@/features/bank/hooks/useBankQueries';
import { useUpdateDisbursementBankMutation } from '../hooks/useDisbursementMutations';
import { AlertOctagon, Landmark, RefreshCcw, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function DisbursementRescueModal({ request, onClose }) {
    const { data: bankAccounts, isLoading: isLoadingBanks } = useBankAccounts();
    const { mutate: updateBank, isPending } = useUpdateDisbursementBankMutation();
    const [selectedBankId, setSelectedBankId] = useState('');

    // Chỉ lấy các bank đã verified và đang ACTIVE
    const verifiedBanks = bankAccounts?.filter(b => b.status === 'ACTIVE' || b.isVerified) || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedBankId) return;

        updateBank(
            { id: request._id, bankAccountId: selectedBankId },
            { onSuccess: onClose }
        );
    };

    return (
        <Modal open onClose={onClose} title="Cập nhật thông tin nhận tiền" size="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Banner báo lỗi từ Kế toán (Backend) */}
                <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                    <div className="flex gap-3">
                        <AlertOctagon className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-red-900">Lệnh chuyển khoản bị từ chối</p>
                            <p className="text-xs text-red-700 mt-1 leading-relaxed">
                                {request.reviewNotes || request.reason || "Ngân hàng thụ hưởng hiện tại đang bảo trì hoặc sai thông tin. Vui lòng chọn một tài khoản khác để Ban quản trị thực hiện chuyển lại."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dropdown chọn Bank cứu hộ */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Chọn tài khoản ngân hàng thay thế
                    </label>
                    
                    {isLoadingBanks ? (
                        <div className="flex items-center justify-center h-12 bg-slate-50 rounded-xl border border-slate-200">
                            <Loader2 className="animate-spin text-slate-400" size={16} />
                        </div>
                    ) : verifiedBanks.length === 0 ? (
                        <div className="p-3 text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-100">
                            Bạn chưa có tài khoản ngân hàng nào khác được xác minh. Vui lòng vào Cài đặt tài khoản để thêm mới.
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {verifiedBanks.map(bank => (
                                <button
                                    key={bank._id}
                                    type="button"
                                    onClick={() => setSelectedBankId(bank._id)}
                                    className={clsx(
                                        "flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all",
                                        selectedBankId === bank._id 
                                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" 
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <Landmark size={18} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 truncate">{bank.bankName}</p>
                                        <p className="text-xs font-medium text-slate-500 truncate">{bank.accountNumber} • {bank.accountName}</p>
                                    </div>
                                    <div className={clsx(
                                        "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                        selectedBankId === bank._id ? "border-slate-900" : "border-slate-300"
                                    )}>
                                        {selectedBankId === bank._id && <div className="h-2 w-2 rounded-full bg-slate-900" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Đóng
                    </button>
                    <button
                        type="submit"
                        disabled={isPending || !selectedBankId}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
                    >
                        {isPending ? "Đang xử lý..." : <><RefreshCcw size={16} /> Xác nhận đổi</>}
                    </button>
                </div>
            </form>
        </Modal>
    );
}