import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminFinanceDetail } from '../hooks/useAdminFinanceQueries';
import { ADMIN_FINANCE_QUERY_KEYS } from '../constants/adminFinance.queryKeys';
import { AdminFinanceEscrowCard } from '../components/AdminFinanceEscrowCard';
import { MilestoneAccordionItem } from '../components/MilestoneAccordionItem';
import { AdminEvidenceReviewModal } from '@/features/evidence/components/admin/AdminEvidenceReviewModal';
import { AdminDisbursementReviewModal } from '@/features/disbursement/components/admin/AdminDisbursementReviewModal';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminFinanceDetailPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const { data, isLoading } = useAdminFinanceDetail(projectId);

    const [reviewingEvidenceId, setReviewingEvidenceId] = useState(null);
    const [reviewingDisbursementId, setReviewingDisbursementId] = useState(null);

    if (isLoading) return <PageLoader />;
    if (!data) return null;

    const { project, escrow, milestones = [] } = data;

    const handleRefreshData = () => {
        queryClient.invalidateQueries({ 
            queryKey: ADMIN_FINANCE_QUERY_KEYS.detail(projectId) 
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => navigate(-1)} className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                    <ArrowLeft size={20} />
                </button>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-black text-slate-900 truncate" title={project.title}>
                        {project.title}
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Finance Management & Audit</p>
                </div>
            </div>

            <AdminFinanceEscrowCard escrow={escrow} />

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={16} />
                        Sổ cái & Lộ trình nghiệm thu
                    </h2>
                </div>

                <div className="space-y-3">
                    {milestones.map(ms => (
                        <MilestoneAccordionItem
                            key={ms.milestoneId}
                            milestone={ms}
                            onReviewEvidence={setReviewingEvidenceId}
                            onReviewDisbursement={setReviewingDisbursementId}
                        />
                    ))}
                </div>
            </div>

            {reviewingEvidenceId && (
                <AdminEvidenceReviewModal
                    evidenceId={reviewingEvidenceId}
                    onClose={() => setReviewingEvidenceId(null)}
                />
            )}
            
            {reviewingDisbursementId && (
                <AdminDisbursementReviewModal
                    requestId={reviewingDisbursementId}
                    onClose={() => setReviewingDisbursementId(null)}
                    onSuccess={handleRefreshData}
                />
            )}
        </div>
    );
}