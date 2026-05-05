import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, FileText, Wallet } from "lucide-react";
import clsx from "clsx";

import { formatProjectCurrencyVND } from "@/features/project/utils/projectDisplay.utils";
import { getStatusLabel } from "@/shared/lib/statusLabels";

const formatDateTime = (value) => {
  if (!value) return "Chua cap nhat";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chua cap nhat";
  return date.toLocaleString("vi-VN");
};

export function MilestoneAccordionItem({
  milestone,
  onReviewEvidence,
  onReviewDisbursement,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    title,
    targetAmount,
    status,
    evidences = [],
    disbursementRequests = [],
  } = milestone;
  const isNonFinancialMilestone = Number(targetAmount || 0) <= 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:border-slate-200">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              status === "COMPLETED"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-50 text-slate-400",
            )}
          >
            {status === "COMPLETED" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">
              {isNonFinancialMilestone ? "Moc khong co ngan sach" : `Ngan sach moc: ${formatProjectCurrencyVND(targetAmount)}`}
            </p>
          </div>
        </div>
        <ChevronDown
          className={clsx(
            "text-slate-400 transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className={clsx(
          "grid grid-cols-1 gap-6 px-5 pb-5 duration-300 animate-in slide-in-from-top-2",
          !isNonFinancialMilestone && "lg:grid-cols-2",
        )}>
          <div className="space-y-3">
            <h5 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <FileText size={12} /> Bao cao nghiem thu ({evidences.length})
            </h5>

            {evidences.length > 0 ? (
              evidences.map((evidence) => (
                <div
                  key={evidence._id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {evidence.reportContent}
                    </p>
                    <span className="text-[9px] font-black uppercase text-slate-400">
                      {getStatusLabel(evidence.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => onReviewEvidence(evidence._id)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold shadow-sm transition-all hover:bg-slate-900 hover:text-white"
                  >
                    Xem xet
                  </button>
                </div>
              ))
            ) : (
              <p className="p-4 text-xs italic text-slate-400">
                Chua co bang chung nao.
              </p>
            )}
          </div>

          {!isNonFinancialMilestone && (
          <div className="space-y-3">
            <h5 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Wallet size={12} /> Lenh giai ngan ({disbursementRequests.length})
            </h5>

            {disbursementRequests.length > 0 ? (
              disbursementRequests.map((request) => {
                const isCompleted = request.status === "COMPLETED";
                const approvedAmount =
                  Number(request.approvedAmount || 0) ||
                  Number(request.requestedAmount || 0);

                return (
                  <div
                    key={request._id}
                    className={clsx(
                      "rounded-2xl border p-4",
                      isCompleted
                        ? "border-slate-200 bg-slate-50"
                        : "border-blue-100 bg-blue-50/50",
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={clsx(
                              "text-[9px] font-black uppercase tracking-widest",
                              isCompleted ? "text-emerald-500" : "text-blue-500",
                            )}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            Request #{String(request._id).slice(-6).toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <DetailPill
                            label="So tien yeu cau"
                            value={formatProjectCurrencyVND(request.requestedAmount)}
                            tone="slate"
                          />
                          <DetailPill
                            label="So tien duyet"
                            value={formatProjectCurrencyVND(approvedAmount)}
                            tone={isCompleted ? "emerald" : "sky"}
                          />
                          <DetailPill
                            label="Ma giao dich"
                            value={request.bankTransactionRef || "Chua chuyen"}
                            tone="amber"
                            breakAll
                          />
                          <DetailPill
                            label="Chuyen luc"
                            value={formatDateTime(request.transferredAt)}
                            tone="violet"
                          />
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <DetailPill
                            label="Cap nhat cuoi"
                            value={formatDateTime(request.updatedAt || request.createdAt)}
                            tone="slate"
                          />
                          <DetailPill
                            label="Ghi chu"
                            value={request.note || "Khong co ghi chu bo sung"}
                            tone="rose"
                          />
                        </div>
                      </div>

                      {!isCompleted && (
                        <button
                          onClick={() => onReviewDisbursement(request._id)}
                          className="shrink-0 rounded-xl border border-blue-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                        >
                          Xu ly tien
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="p-4 text-xs italic text-slate-400">
                Chua co yeu cau rut tien.
              </p>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailPill({ label, value, tone = "slate", breakAll = false }) {
  const toneMap = {
    slate: "border-slate-200 bg-white text-slate-700",
    sky: "border-sky-100 bg-sky-50 text-sky-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
  };

  return (
    <div className={clsx("rounded-2xl border p-3", toneMap[tone] || toneMap.slate)}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className={clsx("mt-1 text-[11px] font-bold leading-5", breakAll && "break-all")}>
        {value}
      </p>
    </div>
  );
}
