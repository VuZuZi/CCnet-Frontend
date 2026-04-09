import { PROJECT_STATUS_STYLES } from '@/shared/constants/project';

export function ProjectStatusBadge({ status, className = '' }) {
    const defaultStyle = "bg-slate-100 text-slate-700 border-slate-200";
    const style = PROJECT_STATUS_STYLES[status] || defaultStyle;

    const displayText = status?.replace(/_/g, ' ') || 'UNKNOWN';

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${style} ${className}`}
        >
            {displayText}
        </span>
    );
}