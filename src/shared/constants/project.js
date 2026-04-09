export const PROJECT_INTENTS = {
    APPROVE: 'APPROVED',
    REVISION: 'REVISION_REQUESTED',
    REJECT: 'REJECTED',
};

export const PROJECT_STATUS = {
    DRAFT: 'DRAFT',
    UNDER_REVIEW: 'UNDER_REVIEW',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    REVISION_REQUESTED: 'REVISION_REQUESTED',
    FUNDING: 'FUNDING',
    RECRUITING: 'RECRUITING',
    EXECUTING: 'EXECUTING',
    DISBURSING: 'DISBURSING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

export const PROJECT_STATUS_STYLES = {
    [PROJECT_STATUS.DRAFT]: 'bg-slate-100 text-slate-700 border-slate-200',
    [PROJECT_STATUS.PENDING_APPROVAL]: 'bg-[#FFFBEB] text-[#B45309] border-[#FBBF24]/35',
    [PROJECT_STATUS.REVISION_REQUESTED]: 'bg-purple-100 text-purple-700 border-purple-200',
    [PROJECT_STATUS.FUNDING]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PROJECT_STATUS.RECRUITING]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    [PROJECT_STATUS.EXECUTING]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [PROJECT_STATUS.DISBURSING]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [PROJECT_STATUS.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
    [PROJECT_STATUS.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
};