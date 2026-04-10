export function formatNotificationDateTime(dateLike) {
  if (!dateLike) return '';

  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getNotificationLabel(type) {
  switch (type) {
    case 'follow_created':
      return 'Follow';
    case 'project_updated':
      return 'Project';
    case 'help_request_assigned':
    case 'help_request_verified':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return 'NeedHelp';
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
      return 'Organizer request';
    case 'system_announcement':
      return 'System';
    case 'donation_successful':
    case 'transaction_failed':
    case 'transaction_refunded':
      return 'Transaction';
    default:
      return 'Notification';
  }
}

export function calculateTotalPages(total, limit) {
  if (!limit) return 1;
  return Math.max(1, Math.ceil((total || 0) / limit));
}