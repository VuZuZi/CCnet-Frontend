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
    case 'project_revision_requested':
      return 'Dự án';

    case 'volunteer_applied':
    case 'volunteer_application_approved':
    case 'volunteer_application_rejected':
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
    case 'volunteer_review_required':
    case 'volunteer_review_submitted':
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
      return 'Yêu cầu tổ chức';

    case 'system_announcement':
      return 'Hệ thống';

    case 'donation_successful':
    case 'refund_request_submitted':
    case 'transaction_failed':
    case 'transaction_refunded':
    case 'refund_request_rejected':
      return 'Giao dịch';

    case 'post_reacted':
      return 'Phản ứng bài viết';

    case 'post_commented':
    case 'comment_replied':
    case 'comment_reacted':
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
      return 'Mở gợi ý';

    case 'help_request_assignment_responded':
      return 'Mở yêu cầu';

    case 'project_approved':
    case 'project_updated':
    case 'project_cancelled':
      return 'Mở dự án';

    case 'project_rejected':
      return 'Xem dự án';

    case 'project_revision_requested':
      return 'Chỉnh sửa dự án';

    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
    case 'volunteer_review_submitted':
      return 'Mở dự án';

    case 'volunteer_review_required':
      return 'Đánh giá volunteer';

    case 'follow_created':
      return 'Mở những người theo dõi';

    case 'post_reacted':
    case 'post_commented':
    case 'comment_replied':
    case 'comment_reacted':
      return 'Mở bài viết';

    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return 'Mở yêu cầu';

    case 'refund_request_submitted':
    case 'refund_request_rejected':
      return 'Mở mục ủng hộ';

    case 'transaction_refunded':
      return 'Mở ví & giao dịch';

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
    case 'comment_replied':
    case 'comment_reacted':
    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
    case 'volunteer_review_required':
    case 'volunteer_review_submitted':
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
    case 'refund_request_submitted':
    case 'refund_request_rejected':
    case 'transaction_refunded':
      return true;

    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
    case 'project_revision_requested':
      return false;

    default:
      return false;
  }
}

export function shouldAllowNotificationDetail(type, actionUrl) {
  return !shouldPreferRelatedNavigation(type, actionUrl);
}
