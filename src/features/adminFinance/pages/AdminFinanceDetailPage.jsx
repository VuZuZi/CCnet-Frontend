import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ClipboardList,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { useAdminFinanceDetail } from "../hooks/useAdminFinanceQueries";
import { ADMIN_FINANCE_QUERY_KEYS } from "../constants/adminFinance.queryKeys";
import { AdminFinanceEscrowCard } from "../components/AdminFinanceEscrowCard";
import { MilestoneAccordionItem } from "../components/MilestoneAccordionItem";
import { AdminEvidenceReviewModal } from "@/features/evidence/components/admin/AdminEvidenceReviewModal";
import { AdminDisbursementReviewModal } from "@/features/disbursement/components/admin/AdminDisbursementReviewModal";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { getStatusLabel } from "@/shared/lib/statusLabels";
import { formatProjectCurrencyVND } from "@/features/project/utils/projectDisplay.utils";

export default function AdminFinanceDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useAdminFinanceDetail(projectId);

  const [reviewingEvidenceId, setReviewingEvidenceId] = useState(null);
  const [reviewingDisbursementId, setReviewingDisbursementId] = useState(null);

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  const { project, escrow, milestones = [], moneyFlow = {}, ledgerEntries = [] } =
    data;

  const handleRefreshData = () => {
    queryClient.invalidateQueries({
      queryKey: ADMIN_FINANCE_QUERY_KEYS.detail(projectId),
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-2xl font-black text-slate-900"
            title={project.title}
          >
            {project.title}
          </h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Tổng quan tài chính dự án
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-slate-600">
          {getStatusLabel(project.status)}
        </span>
      </div>

      <AdminFinanceEscrowCard escrow={escrow} />

      <section className="grid gap-4 md:grid-cols-3">
        <FlowCard
          icon={Landmark}
          tone="emerald"
          label="Tổng đóng góp cho dự án"
          value={formatProjectCurrencyVND(moneyFlow.totalProjectDonations)}
        />
        <FlowCard
          icon={ClipboardList}
          tone="sky"
          label="Đã giải ngân"
          value={formatProjectCurrencyVND(moneyFlow.totalDisbursed)}
        />
        <FlowCard
          icon={WalletCards}
          tone="amber"
          label="Đang chờ giải ngân"
          value={formatProjectCurrencyVND(escrow?.pendingDisbursementAmount)}
        />
      </section>

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 md:px-6">
          <h2 className="text-lg font-black text-slate-900">
            Cập nhật tài chính gần nhất
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Những thay đổi mới nhất về quyên góp và giải ngân của dự án này.
          </p>
        </div>

        <div className="space-y-3 p-5 md:p-6">
          {ledgerEntries.length > 0 ? (
            ledgerEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-slate-700">
                        {entry.type}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        {getStatusLabel(entry.status)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                      {entry.message || "Không có ghi chú bổ sung."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1">
                        Tạo lúc {new Date(entry.createdAt).toLocaleString("vi-VN")}
                      </span>
                      {entry.bankTransactionRef ? (
                        <span className="rounded-full bg-white px-3 py-1">
                          Ref: {entry.bankTransactionRef}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-[180px] rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
                      Giá trị
                    </p>
                    <p className="mt-2 text-xl font-black text-slate-900">
                      {formatProjectCurrencyVND(entry.amount)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Trước xử lý {formatProjectCurrencyVND(entry.grossAmount)} | Sau xử lý{" "}
                      {formatProjectCurrencyVND(entry.netAmount)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
              Chưa có cập nhật tài chính nào cho dự án này.
            </div>
          )}
        </div>
      </section>

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

function FlowCard({ icon: Icon, tone, label, value }) {
  const tones = {
    emerald:
      "border-emerald-100 bg-[linear-gradient(180deg,#F0FDF4_0%,#FFFFFF_100%)]",
    sky: "border-sky-100 bg-[linear-gradient(180deg,#F0F9FF_0%,#FFFFFF_100%)]",
    amber:
      "border-amber-100 bg-[linear-gradient(180deg,#FFF7ED_0%,#FFFFFF_100%)]",
  };

  return (
    <div
      className={`rounded-[28px] border p-5 shadow-sm ${tones[tone] || tones.emerald}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <Icon size={20} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
}
