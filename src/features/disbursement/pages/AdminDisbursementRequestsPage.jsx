import React, { useState } from 'react';
import { useAdminDisbursementList } from '../hooks/useDisbursementQueries';
import { AdminDisbursementTable } from '../components/admin/AdminDisbursementTable';
import { AdminDisbursementReviewModal } from '../components/admin/AdminDisbursementReviewModal';
import { HandCoins } from 'lucide-react';

const AdminDisbursementRequestsPage = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [filters, setFilters] = useState({ page: 1, limit: 10 });
    const { data, isLoading, refetch } = useAdminDisbursementList(filters);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-black text-slate-900">Lệnh giải ngân</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Quản lý dòng tiền ra và đối soát chuyển khoản ngân hàng.</p>
            </header>

            <AdminDisbursementTable
                items={data?.items}
                isLoading={isLoading}
                onAction={(id) => setSelectedId(id)}
            />

            {selectedId && (
                <AdminDisbursementReviewModal
                    requestId={selectedId}
                    onClose={() => {
                        setSelectedId(null);
                        refetch();
                    }}
                />
            )}
        </div>
    );
};

export default AdminDisbursementRequestsPage;