import { useState } from 'react';
import { useBankAccounts } from '../hooks/useBankQueries';
import { CreditCard, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { AddBankModal } from './AddBankModal';

export function BankAccountManager() {
    const { data: accounts, isLoading } = useBankAccounts();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Thẻ ngân hàng</h3>
                    <p className="text-sm text-slate-500 mt-1">Dùng để rút tiền quyên góp hoặc tiền thừa.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                    <Plus size={18} /> Thêm thẻ
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {isLoading ? (
                    <div className="col-span-2 py-10 text-center text-slate-400">Đang tải thẻ...</div>
                ) : accounts?.length === 0 ? (
                    <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
                        <CreditCard className="mx-auto mb-3 h-8 w-8 opacity-40" />
                        <p className="font-medium">Bạn chưa liên kết thẻ ngân hàng nào.</p>
                    </div>
                ) : (
                    accounts?.map((acc) => (
                        <div key={acc.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="font-bold text-slate-900">{acc.bankName}</span>
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>
                            <p className="font-mono text-lg font-bold tracking-widest text-slate-700">
                                **** **** {acc.accountNumber.slice(-4)}
                            </p>
                            <p className="mt-1 text-sm font-medium uppercase text-slate-500">{acc.accountName}</p>
                        </div>
                    ))
                )}
            </div>

            <AddBankModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
}