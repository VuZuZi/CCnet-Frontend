import React from 'react';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { Landmark, HandCoins, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export function AdminDisbursementTable({ items = [], onAction, isLoading }) {
    if (isLoading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-slate-100" />)}</div>;

    return (
        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung giải ngân</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Người nhận</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Số tiền</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Xử lý</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items.map((row) => (
                        <tr key={row._id} className="group hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 line-clamp-1">{row.projectId?.title}</span>
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                                        <Landmark size={12} />
                                        <span>{row.bankAccountSnapshot?.bankName} • {row.bankAccountSnapshot?.accountNumber}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 font-bold text-xs text-slate-700">{row.organizerId?.fullName}</td>
                            <td className="px-6 py-5 text-right font-black text-sm text-emerald-600">
                                {formatProjectCurrencyVND(row.approvedAmount)}
                            </td>
                            <td className="px-6 py-5">
                                <span className={clsx(
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter",
                                    row.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                                    row.status === 'APPROVED_PENDING_TRANSFER' ? "bg-blue-100 text-blue-700 animate-pulse" :
                                    "bg-slate-100 text-slate-500"
                                )}>
                                    {row.status.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <button
                                    onClick={() => onAction(row._id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-bold uppercase text-white shadow-sm hover:bg-slate-800"
                                >
                                    {row.status === 'COMPLETED' ? 'Xem lại' : 'Xử lý ngay'}
                                    <ChevronRight size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}