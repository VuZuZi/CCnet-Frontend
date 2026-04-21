import React, { useState } from 'react';
import { useAdminEvidenceList } from '../hooks/useEvidenceQueries';
import { AdminEvidenceTable } from '../components/admin/AdminEvidenceTable';
import { AdminEvidenceReviewModal } from '../components/admin/AdminEvidenceReviewModal';
import { ClipboardCheck, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';

const AdminEvidenceReviewPage = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [filters, setFilters] = useState({ page: 1, limit: 10, status: 'PENDING' });

    const { data, isLoading, refetch, isFetching } = useAdminEvidenceList(filters);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Duyệt nghiệm thu</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Kiểm tra thực địa và quyết toán ngân sách giai đoạn.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={isFetching ? "animate-spin" : ""} />
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit">
                {['PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'ALL'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilters(prev => ({ ...prev, status: s === 'ALL' ? undefined : s, page: 1 }))}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            (filters.status === s || (s === 'ALL' && !filters.status))
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {s === 'REVISION_REQUESTED' ? 'Cần sửa' : s}
                    </button>
                ))}
            </div>

            <AdminEvidenceTable
                items={data?.items}
                isLoading={isLoading}
                onAction={(id) => setSelectedId(id)}
            />

            {selectedId && (
                <AdminEvidenceReviewModal
                    evidenceId={selectedId}
                    onClose={() => {
                        setSelectedId(null);
                        refetch();
                    }}
                />
            )}
        </div>
    );
};

export default AdminEvidenceReviewPage;