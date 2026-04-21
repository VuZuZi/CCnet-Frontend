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
    REJECTED: 'REJECTED',
    
    FUNDING: 'FUNDING',
    RECRUITING: 'RECRUITING',
    ADJUSTMENT_REQUIRED: 'ADJUSTMENT_REQUIRED',
    FAILED_FUNDING: 'FAILED_FUNDING',
    
    EXECUTING: 'EXECUTING',
    UPDATING: 'UPDATING',
    PAUSED: 'PAUSED',
    
    CANCELLATION_PENDING: 'CANCELLATION_PENDING',
    CANCELLED_FRAUD: 'CANCELLED_FRAUD',
    CANCELLED_BY_PLATFORM: 'CANCELLED_BY_PLATFORM',
    CANCELLED_BY_ORGANIZER: 'CANCELLED_BY_ORGANIZER',
    
    PENDING_COMPLETION: 'PENDING_COMPLETION',
    COMPLETED_SUCCESSFULLY: 'COMPLETED_SUCCESSFULLY',
    COMPLETED_PARTIAL: 'COMPLETED_PARTIAL',
    FAILED_EXECUTION: 'FAILED_EXECUTION',
};

export const PROJECT_TYPE = {
    FUNDED: 'FUNDED',
    VOLUNTEER_ONLY: 'VOLUNTEER_ONLY'
};

export const PROJECT_SORT = {
    NEWEST: 'newest',
    TRENDING: 'trending',
    ENDING_SOON: 'ending_soon',
};

export const PROJECT_STATUS_STYLES = {
    [PROJECT_STATUS.DRAFT]: 'bg-slate-100 text-slate-700 border-slate-200',
    [PROJECT_STATUS.UNDER_REVIEW]: 'bg-[#FFFBEB] text-[#B45309] border-[#FBBF24]/35',
    [PROJECT_STATUS.PENDING_APPROVAL]: 'bg-[#FFFBEB] text-[#B45309] border-[#FBBF24]/35',
    [PROJECT_STATUS.REVISION_REQUESTED]: 'bg-purple-100 text-purple-700 border-purple-200',
    [PROJECT_STATUS.REJECTED]: 'bg-red-50 text-red-600 border-red-200',
    [PROJECT_STATUS.FUNDING]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PROJECT_STATUS.RECRUITING]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    [PROJECT_STATUS.ADJUSTMENT_REQUIRED]: 'bg-orange-100 text-orange-700 border-orange-200',
    [PROJECT_STATUS.FAILED_FUNDING]: 'bg-stone-100 text-stone-700 border-stone-200',
    [PROJECT_STATUS.EXECUTING]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [PROJECT_STATUS.UPDATING]: 'bg-amber-100 text-amber-800 border-amber-200',
    [PROJECT_STATUS.PAUSED]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [PROJECT_STATUS.CANCELLATION_PENDING]: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse',
    [PROJECT_STATUS.CANCELLED_FRAUD]: 'bg-red-600 text-white border-red-700',
    [PROJECT_STATUS.CANCELLED_BY_PLATFORM]: 'bg-red-100 text-red-700 border-red-200',
    [PROJECT_STATUS.CANCELLED_BY_ORGANIZER]: 'bg-stone-200 text-stone-600 border-stone-300',
    
    [PROJECT_STATUS.PENDING_COMPLETION]: 'bg-teal-100 text-teal-700 border-teal-200',
    [PROJECT_STATUS.COMPLETED_SUCCESSFULLY]: 'bg-green-100 text-green-700 border-green-200',
    [PROJECT_STATUS.COMPLETED_PARTIAL]: 'bg-lime-100 text-lime-700 border-lime-200',
    [PROJECT_STATUS.FAILED_EXECUTION]: 'bg-gray-800 text-gray-100 border-gray-900',
};
