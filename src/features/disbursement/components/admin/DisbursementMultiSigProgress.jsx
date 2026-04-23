import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import clsx from 'clsx';

export function DisbursementMultiSigProgress({ request }) {
    const approvals = request.approvals || [];
    const required = request.requiredApprovals || 1;

    const isFirstApproved = approvals.length >= 1 && approvals[0].decision === 'APPROVED';
    const isSecondApproved = approvals.length >= 2 && approvals[1].decision === 'APPROVED';
    const isTransferDone = request.status === 'COMPLETED';

    const steps = [];
    steps.push({ label: 'Nhà tổ chức yêu cầu', status: 'DONE' });

    if (required === 1) {
        steps.push({
            label: 'Ban quản trị duyệt',
            status: isFirstApproved ? 'DONE' : 'PENDING'
        });
        steps.push({
            label: 'Chuyển khoản & Đối soát',
            status: isTransferDone ? 'DONE' : (isFirstApproved ? 'PENDING' : 'WAITING')
        });
    } else {
        steps.push({
            label: 'Quản lý phê duyệt',
            status: isFirstApproved ? 'DONE' : 'PENDING'
        });
        steps.push({
            label: 'Quản trị viên xác nhận',
            status: isSecondApproved ? 'DONE' : (isFirstApproved ? 'PENDING' : 'WAITING')
        });
        steps.push({
            label: 'Chuyển khoản & Đối soát',
            status: isTransferDone ? 'DONE' : (isSecondApproved ? 'PENDING' : 'WAITING')
        });
    }

    return (
        <div className="py-4">
            <div className="flex items-center justify-between">
                {steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                        <div className="flex flex-col items-center gap-2 flex-1 z-10">
                            <div className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all bg-white",
                                step.status === 'DONE' ? "border-emerald-500 text-emerald-500" :
                                    step.status === 'PENDING' ? "border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" :
                                        "border-slate-200 text-slate-300"
                            )}>
                                {step.status === 'DONE' ? <CheckCircle2 size={16} /> :
                                    step.status === 'PENDING' ? <Clock size={16} className="animate-pulse" /> :
                                        <Circle size={12} />}
                            </div>
                            <span className={clsx(
                                "text-[10px] font-bold uppercase tracking-tighter text-center max-w-[80px]",
                                step.status === 'DONE' ? "text-slate-900" :
                                    step.status === 'PENDING' ? "text-amber-700" : "text-slate-400"
                            )}>
                                {step.label}
                            </span>
                        </div>

                        {idx !== steps.length - 1 && (
                            <div className="flex-1 h-0.5 -mt-6 mx-[-10%] z-0 relative">
                                <div className="absolute inset-0 bg-slate-100 rounded-full" />
                                <div className={clsx(
                                    "absolute inset-0 rounded-full transition-all duration-500",
                                    steps[idx + 1].status !== 'WAITING' ? "bg-emerald-500 w-full" : "w-0"
                                )} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
