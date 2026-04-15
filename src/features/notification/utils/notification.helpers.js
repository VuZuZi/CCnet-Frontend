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
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
      return 'Project';
    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return 'NeedHelp';
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return 'Organizer request';
    case 'system_announcement':
      return 'System';
    case 'donation_successful':
    case 'transaction_failed':
    case 'transaction_refunded':
      return 'Transaction';
    case 'post_reacted':
      return 'Post reaction';
    case 'post_commented':
      return 'Post comment';
    default:
      return 'Notification';
  }
}

export function calculateTotalPages(total, limit) {
  if (!limit) return 1;
  return Math.max(1, Math.ceil((total || 0) / limit));
}

export function getNotificationPrimaryActionLabel(type, actionUrl) {
  if (!actionUrl) return '';

  switch (type) {
    case 'help_request_verified':
    case 'help_request_completed':
      return 'Open request';

    case 'help_request_rejected':
      return 'Edit request';

    case 'help_request_assigned':
    case 'help_request_reassigned':
      return 'Open assignment';

    case 'help_request_assignment_responded':
      return 'Open request';

    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
      return 'Open project';

    case 'follow_created':
      return 'Open followers';

    case 'post_reacted':
    case 'post_commented':
      return 'Open post';

    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return 'Open request';

    default:
      return 'Open related';
  }
}

export function shouldPreferRelatedNavigation(type, actionUrl) {
  if (!actionUrl) return false;

  switch (type) {
    case 'follow_created':
    case 'post_reacted':
    case 'post_commented':
    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return true;

    default:
      return false;
  }
}

export function shouldAllowNotificationDetail(type, actionUrl) {
  return !shouldPreferRelatedNavigation(type, actionUrl);
}