import React from 'react';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { Landmark, TrendingUp, AlertCircle } from 'lucide-react';

export function AdminFinanceEscrowCard({ escrow }) {
    const { availableBalance, totalDisbursed, pendingDisbursementAmount } = escrow || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
                <Landmark className="absolute -right-4 -bottom-4 text-white/5" size={100} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số dư khả dụng (Escrow)</p>
                <h3 className="mt-2 text-2xl font-black">{formatProjectCurrencyVND(availableBalance)}</h3>
            </div>

            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <TrendingUp size={18} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Đã giải ngân</p>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{formatProjectCurrencyVND(totalDisbursed)}</h3>
            </div>

            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-amber-500 mb-2">
                    <AlertCircle size={18} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Đang chờ xử lý</p>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{formatProjectCurrencyVND(pendingDisbursementAmount)}</h3>
            </div>
        </div>
    );
}