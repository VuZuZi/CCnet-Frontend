import React, { useState } from 'react';
import { formatProjectCurrencyVND } from '@/features/project/utils/projectDisplay.utils';
import { SubmitEvidenceModal } from './SubmitEvidenceModal';
import { RequestDisbursementModal } from '@/features/disbursement/components/RequestDisbursementModal';
import { DisbursementRescueModal } from '@/features/disbursement/components/DisbursementRescueModal';
import { 
  CheckCircle2, Clock, Camera, Wallet, 
  ArrowRightLeft, ShieldCheck, AlertCircle, FileWarning, Lock
} from 'lucide-react';
import clsx from 'clsx';

export function ProjectMilestonesTab({ project, isOrganizer }) {
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [disbursementTarget, setDisbursementTarget] = useState(null);
    const [rescueTarget, setRescueTarget] = useState(null);

    const milestones = project?.milestones || [];
    const isVolunteerOnly = project?.projectType === 'VOLUNTEER_ONLY';
    const isProjectExecuting = project?.status === 'EXECUTING';

    return (
        <div className="space-y-8 p-2 sm:p-6">
            {/* Header Tổng quan minh bạch - Đã map với DTO financialOverview mới */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-[28px] bg-slate-900 p-6 text-white shadow-xl">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Sổ Cái Minh Bạch</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        {isVolunteerOnly ? 'Theo dõi Lộ trình và Bằng chứng thực tế' : 'Mô hình Tạm ứng cuốn chiếu: Rút tiền -> Thực thi -> Nghiệm thu'}
                    </p>
                </div>
                {!isVolunteerOnly && project?.financialOverview && (
                    <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0 rounded-2xl bg-slate-800/50 p-4 border border-slate-700/50">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Khả dụng (Available)</p>
                            <p className="text-sm font-black text-blue-400">
                                {formatProjectCurrencyVND(project.financialOverview.withdrawableBalance)}
                            </p>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden sm:block" />
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Đang chờ (Pending)</p>
                            <p className="text-sm font-black text-amber-400">
                                {formatProjectCurrencyVND(project.financialOverview.pendingDisbursement)}
                            </p>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden sm:block" />
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Đã nhận (Disbursed)</p>
                            <p className="text-sm font-black text-emerald-400">
                                {formatProjectCurrencyVND(project.financialOverview.totalDisbursed)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative space-y-12 before:absolute before:left-[23px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 sm:before:left-[31px]">
                {milestones.map((ms, idx) => {
                    const previousMilestone = idx > 0 ? milestones[idx - 1] : null;
                    const isPreviousMilestoneCompleted = previousMilestone?.status === 'COMPLETED';
                    const isCurrentMilestonePending = ms?.status === 'PENDING';
                    const requiredDisbursementAmount = Number(
                        ms?.requiredDisbursementAmount ?? ms?.targetAmount ?? 0
                    );
                    const hasBudget = requiredDisbursementAmount > 0;
                    const canRequestDisbursement =
                        hasBudget &&
                        isProjectExecuting &&
                        isCurrentMilestonePending &&
                        (idx === 0 || isPreviousMilestoneCompleted);

                    return (
                        <MilestoneLedgerItem 
                            key={ms.milestoneId || idx}
                            ms={ms}
                            index={idx}
                            isOrganizer={isOrganizer}
                            isVolunteerOnly={isVolunteerOnly}
                            canRequestDisbursement={canRequestDisbursement}
                            isProjectExecuting={isProjectExecuting}
                            onNopNghiemThu={() => setSelectedMilestone(ms)}
                            onYeuCauGiaiNgan={() => setDisbursementTarget(ms)}
                            onCuuHo={() => setRescueTarget(ms)}
                        />
                    );
                })}
            </div>

            {/* Modals Layer - Truyền full project xuống */}
            {selectedMilestone && (
                <SubmitEvidenceModal
                    project={project}
                    milestone={selectedMilestone}
                    onClose={() => setSelectedMilestone(null)}
                />
            )}

            {disbursementTarget && (
                <RequestDisbursementModal
                    project={project}
                    milestone={disbursementTarget}
                    onClose={() => setDisbursementTarget(null)}
                />
            )}

            {rescueTarget && (
                <DisbursementRescueModal
                    request={{ _id: rescueTarget.disbursementId || rescueTarget.disbursementRequestId }}
                    onClose={() => setRescueTarget(null)}
                />
            )}
        </div>
    );
}

// --- Sub-component cho từng dòng Sổ cái ---
function MilestoneLedgerItem({ ms, index, isOrganizer, isVolunteerOnly, canRequestDisbursement, isProjectExecuting, onNopNghiemThu, onYeuCauGiaiNgan, onCuuHo }) {
    const isCompleted = ms.status === 'COMPLETED';
    const requiredDisbursementAmount = Number(
        ms?.requiredDisbursementAmount ?? ms?.targetAmount ?? 0
    );
    const isDisbursementRequired = !isVolunteerOnly && requiredDisbursementAmount > 0;
    
    // Mapping trạng thái thực tế
    const evStatus = ms.evidenceStatus || 'NOT_SUBMITTED';
    const disStatus = ms.disbursementStatus || 'NOT_STARTED';
    
    const hasActiveDisbursement = ['PENDING', 'APPROVED_PENDING_TRANSFER', 'COMPLETED', 'HOLD'].includes(disStatus);
    const isDisbursementCompleted = disStatus === 'COMPLETED';
    const canSubmitEvidence =
        isOrganizer &&
        (evStatus === 'NOT_SUBMITTED' || evStatus === 'REVISION_REQUESTED') &&
        (isVolunteerOnly || !isDisbursementRequired || isDisbursementCompleted);

    return (
        <div className="relative flex gap-6 pl-0 sm:pl-2 animate-in slide-in-from-left-4 duration-500">
            {/* Circle Marker */}
            <div className={clsx(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 bg-white z-10 transition-all shadow-sm",
                isCompleted ? "border-emerald-500 text-emerald-500" : "border-slate-100 text-slate-300"
            )}>
                {isCompleted ? <ShieldCheck size={24} /> : <span className="text-sm font-black">{index + 1}</span>}
            </div>

            {/* Content Card */}
            <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h4 className="text-base font-black text-slate-900">{ms.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ms.description}</p>
                    </div>
                    {!isVolunteerOnly && (
                        <div className="bg-slate-100 px-3 py-1.5 rounded-xl shrink-0 text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ngân sách tạm ứng</p>
                            <p className="text-sm font-black text-slate-900">{formatProjectCurrencyVND(ms.targetAmount)}</p>
                        </div>
                    )}
                </div>

                <div className={clsx("grid gap-3", isVolunteerOnly ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                    
                    {/* Block: Dòng tiền (Rút tiền trước) */}
                    {!isVolunteerOnly && (
                        <div className={clsx(
                            "rounded-2xl border p-4 transition-all",
                            disStatus === 'HOLD' ? "bg-red-50 border-red-200" : "bg-blue-50/30 border-blue-100"
                        )}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                    <Wallet size={12} /> Tiến trình Tạm ứng
                                </span>
                                <DisbursementBadge status={disStatus} />
                            </div>

                            <div className="flex gap-2">
                                {/* Khóa liên động (Interlock) cho nút Rút Tiền */}
                                {isOrganizer && !isDisbursementRequired && (
                                    <div className="flex w-full items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-tight cursor-default">
                                        Mốc 0đ không cần yêu cầu giải ngân
                                    </div>
                                )}

                                {isOrganizer && isDisbursementRequired && !hasActiveDisbursement && (
                                    canRequestDisbursement ? (
                                        <button onClick={onYeuCauGiaiNgan} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition-colors">
                                            Yêu cầu rút tiền
                                        </button>
                                    ) : (
                                        <div className="flex w-full items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-tight cursor-not-allowed">
                                            <Lock size={12} /> 
                                            {!isProjectExecuting 
                                                ? 'Chờ dự án sang Thực thi' 
                                                : 'Chờ mốc trước nghiệm thu'
                                            }
                                        </div>
                                    )
                                )}

                                {/* Điều kiện Cứu hộ */}
                                {isOrganizer && disStatus === 'HOLD' && (
                                    <button onClick={onCuuHo} className="w-full py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 animate-pulse">
                                        Sửa số tài khoản bị lỗi
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Block: Nghiệm thu (Báo cáo sau) */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                <Camera size={12} /> Bằng chứng thực thi
                            </span>
                            <EvidenceBadge status={evStatus} />
                        </div>
                        
                        {/* Organizer chỉ được nộp bằng chứng khi (Đã nhận được tiền HOẶC là dự án tình nguyện) và đang ở trạng thái cho phép nộp */}
                        {canSubmitEvidence && (
                            <button onClick={onNopNghiemThu} className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                {evStatus === 'REVISION_REQUESTED' ? 'Nộp lại báo cáo' : 'Nộp báo cáo + Hóa đơn'}
                            </button>
                        )}
                        {/* Block hiển thị nếu chưa nhận được tiền */}
                         {isOrganizer && isDisbursementRequired && !isDisbursementCompleted && evStatus === 'NOT_SUBMITTED' && (
                            <div className="flex w-full items-center justify-center gap-1.5 py-2 rounded-xl bg-transparent text-slate-400 text-[10px] italic cursor-default">
                                Chỉ nộp khi đã nhận tạm ứng
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EvidenceBadge({ status }) {
    const map = {
        'NOT_SUBMITTED': { label: 'Chưa nộp', css: 'text-slate-400 italic bg-transparent' },
        'PENDING': { label: 'Đang duyệt', css: 'bg-amber-100 text-amber-600 border border-amber-200' },
        'APPROVED': { label: 'Đã nghiệm thu', css: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
        'REVISION_REQUESTED': { label: 'Cần sửa đổi', css: 'bg-purple-50 text-purple-600 border border-purple-100' },
        'REJECTED': { label: 'Bị từ chối', css: 'bg-red-50 text-red-600 border border-red-100' },
    };
    const config = map[status] || map['NOT_SUBMITTED'];
    return (
        <span className={clsx("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter", config.css)}>
            {config.label}
        </span>
    );
}

function DisbursementBadge({ status }) {
    const map = {
        'NOT_STARTED': { label: 'Chưa tạo lệnh', css: 'bg-slate-100 text-slate-400' },
        'PENDING': { label: 'Chờ kế toán', css: 'bg-amber-100 text-amber-600' },
        'APPROVED_PENDING_TRANSFER': { label: 'Đang chờ chuyển', css: 'bg-blue-100 text-blue-600' },
        'HOLD': { label: 'Lỗi ngân hàng', css: 'bg-red-600 text-white' },
        'COMPLETED': { label: 'Đã nhận tiền', css: 'bg-emerald-500 text-white' },
        'REJECTED': { label: 'Bị hủy', css: 'bg-slate-800 text-white' },
    };
    const config = map[status] || map['NOT_STARTED'];
    return (
        <span className={clsx("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter", config.css)}>
            {config.label}
        </span>
    );
}
