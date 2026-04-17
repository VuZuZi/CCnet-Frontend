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
      return 'Theo dõi';
    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
      return 'Dự án';
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
      return 'Tình nguyện viên';
    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return 'Yêu cầu trợ giúp';
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return 'Yêu cầu nhà tổ chức';
    case 'system_announcement':
      return 'Hệ thống';
    case 'donation_successful':
    case 'transaction_failed':
    case 'transaction_refunded':
      return 'Giao dịch';
    case 'post_reacted':
      return 'Phản ứng bài viết';
    case 'post_commented':
      return 'Bình luận bài viết';
    default:
      return 'Thông báo';
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
      return 'Mở yêu cầu';

    case 'help_request_rejected':
      return 'Chỉnh sửa yêu cầu';

    case 'help_request_assigned':
    case 'help_request_reassigned':
      return 'Mở giao việc';

    case 'help_request_assignment_responded':
      return 'Mở yêu cầu';

    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
      return 'Mở dự án';

    case 'follow_created':
      return 'Mở những người theo dõi';

    case 'post_reacted':
    case 'post_commented':
      return 'Mở bài viết';

    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return 'Mở yêu cầu';

    default:
      return 'Mở liên quan';
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
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
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