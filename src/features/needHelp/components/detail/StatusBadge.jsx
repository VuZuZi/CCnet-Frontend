import { AlertCircle, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/shared/components/ui/Button/Button';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ kiểm duyệt',
    icon: Clock,
    className: 'border border-amber-200 bg-amber-100 text-amber-800',
  },
  VERIFIED: {
    label: 'Đã xác minh',
    icon: CheckCircle,
    className: 'border border-emerald-200 bg-emerald-100 text-emerald-800',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    icon: Loader2,
    className: 'border border-sky-200 bg-sky-100 text-sky-800',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    icon: CheckCircle,
    className: 'border border-slate-200 bg-slate-100 text-slate-700',
  },
  REJECTED: {
    label: 'Bị từ chối',
    icon: XCircle,
    className: 'border border-rose-200 bg-rose-100 text-rose-800',
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: AlertCircle,
    className: 'border border-slate-200 bg-slate-100 text-slate-500',
  },
};

const SIZE_STYLES = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export function StatusBadge({ status, size = 'md', className }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold',
        config.className,
        SIZE_STYLES[size] || SIZE_STYLES.md,
        className
      )}
    >
      <Icon
        size={size === 'sm' ? 13 : 15}
        className={status === 'IN_PROGRESS' ? 'animate-spin' : undefined}
      />
      {config.label}
    </div>
  );
}

export default StatusBadge;