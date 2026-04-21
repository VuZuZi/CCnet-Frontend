import React from 'react';
import { formatProjectCurrencyVND, formatProjectDate } from '@/features/project/utils/projectDisplay.utils';
import { Eye, FileText, User, MapPin } from 'lucide-react';
import clsx from 'clsx';

export function AdminEvidenceTable({ items = [], onAction, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-slate-100" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-[32px] border-2 border-dashed border-slate-100 py-20 text-center">
                <FileText className="mx-auto mb-4 text-slate-200" size={48} />
                <p className="text-sm font-medium text-slate-400">Không có báo cáo nghiệm thu nào cần xử lý.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Dự án & Mốc</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Người thực hiện</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Giá trị mốc</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items.map((row) => (
                        <tr key={row._id} className="group hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 line-clamp-1">{row.projectId?.title}</span>
                                    <span className="mt-0.5 text-[11px] font-medium text-slate-500 italic">Mốc: {row.milestoneId}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                                        <img src={row.organizerId?.avatar} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{row.organizerId?.fullName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-right font-black text-sm text-slate-900">
                                {formatProjectCurrencyVND(row.financialReport?.spentAmount || 0)}
                            </td>
                            <td className="px-6 py-5">
                                <span className={clsx(
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tight",
                                    row.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                                    row.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600" :
                                    "bg-red-50 text-red-600"
                                )}>
                                    {row.status}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <button
                                    onClick={() => onAction(row._id)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all hover:scale-105"
                                >
                                    <Eye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}