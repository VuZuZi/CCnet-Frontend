import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

import { useAdminFinanceDetail } from "../hooks/useAdminFinanceQueries";
import { ADMIN_FINANCE_QUERY_KEYS } from "../constants/adminFinance.queryKeys";
import { AdminFinanceEscrowCard } from "../components/AdminFinanceEscrowCard";
import { MilestoneAccordionItem } from "../components/MilestoneAccordionItem";
import { AdminEvidenceReviewModal } from "@/features/evidence/components/admin/AdminEvidenceReviewModal";
import { AdminDisbursementReviewModal } from "@/features/disbursement/components/admin/AdminDisbursementReviewModal";
import { PageLoader } from "@/shared/components/ui/PageLoader";

export default function AdminFinanceDetailPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useAdminFinanceDetail(projectId);

  const [reviewingEvidenceId, setReviewingEvidenceId] = useState(null);
  const [reviewingDisbursementId, setReviewingDisbursementId] = useState(null);

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  const { escrow, milestones = [] } = data;

  const handleRefreshData = () => {
    queryClient.invalidateQueries({
      queryKey: ADMIN_FINANCE_QUERY_KEYS.detail(projectId),
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
      <AdminFinanceEscrowCard escrow={escrow} />

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
            <ShieldCheck className="text-emerald-500" size={16} />
            Tiến độ theo mốc và lộ trình xác nhận
          </h2>
        </div>

        <div className="space-y-3">
          {milestones.map((ms) => (
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
