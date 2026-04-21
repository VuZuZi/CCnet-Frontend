import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminFinanceDetail } from '../hooks/useAdminFinanceQueries';
import { AdminFinanceEscrowCard } from '../components/AdminFinanceEscrowCard';
import { MilestoneAccordionItem } from '../components/MilestoneAccordionItem';
import { AdminEvidenceReviewModal } from '@/features/evidence/components/admin/AdminEvidenceReviewModal';
import { AdminDisbursementReviewModal } from '@/features/disbursement/components/admin/AdminDisbursementReviewModal';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminFinanceDetailPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useAdminFinanceDetail(projectId);

    const [reviewingEvidenceId, setReviewingEvidenceId] = useState(null);
    const [reviewingDisbursementId, setReviewingDisbursementId] = useState(null);

    if (isLoading) return <PageLoader />;
    if (!data) return null;

    const { project, escrow, milestones = [] } = data;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">{project.title}</h1>
                    <p className="text-sm text-slate-500">ID Dự án: {project.id} • Organizer: {project.organizer?.fullName}</p>
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
                />
            )}
        </div>
    );
}