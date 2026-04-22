import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminFinanceSummary } from '../hooks/useAdminFinanceQueries';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { Activity, ChevronRight, AlertCircle, FileCheck } from 'lucide-react';

export default function AdminFinanceSummaryPage() {
    const navigate = useNavigate();
    const [filters] = useState({ page: 1, limit: 15 });
    const { data, isLoading } = useAdminFinanceSummary(filters);

    if (isLoading) return <PageLoader />;

    const projects = data?.projects ?? [];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header>
                <h1 className="text-3xl font-black text-slate-900 flex flex-wrap items-center gap-3">
                    <Activity className="text-emerald-600" size={32} />
                    Finance Ledger Control
                </h1>
                <p className="text-slate-500 mt-2">Giám sát dòng tiền và phê duyệt nghiệm thu toàn hệ thống.</p>
            </header>

            <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] table-fixed text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="w-[44%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Dự án</th>
                            <th className="w-[18%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Số dư Escrow</th>
                            <th className="w-[16%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Đã chi</th>
                            <th className="w-[16%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Chờ duyệt</th>
                            <th className="w-[6%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {projects.map(proj => (
                            <tr key={proj._id} className="hover:bg-slate-50/50 transition-colors group">
                               <td className="px-6 py-5 max-w-[200px] sm:max-w-[300px]">
    <p 
        className="text-sm font-bold text-slate-900 truncate" 
        title={proj.title}
    >
        {proj.title}
    </p>
    <span className="text-[10px] font-medium text-slate-400 uppercase">{proj.status}</span>
</td>
                                <td className="px-6 py-5 text-sm font-black text-slate-700">
                                    {formatProjectCurrencyVND(proj.escrowBalance)}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-500">
                                    {formatProjectCurrencyVND(proj.totalDisbursed)}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex justify-center gap-2">
                                        {proj.pendingEvidenceCount > 0 && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600 border border-amber-100">
                                                <FileCheck size={10} /> {proj.pendingEvidenceCount}
                                            </span>
                                        )}
                                        {proj.pendingDisbursementCount > 0 && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 border border-red-100">
                                                <AlertCircle size={10} /> {proj.pendingDisbursementCount}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => navigate(`/admin/finance/${proj._id}`)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition-all hover:bg-slate-900 hover:text-white group-hover:scale-110 shadow-sm"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}