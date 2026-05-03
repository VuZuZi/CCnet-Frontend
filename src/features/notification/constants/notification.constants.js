export const NOTIFICATION_QUERY_KEYS = Object.freeze({
  all: ["notifications"],
  list: ["notifications", "list"],
  unreadCount: ["notifications", "unread-count"],
  settings: ["notifications", "settings"],
});

export const NOTIFICATION_SSE_EVENTS = Object.freeze({
  CONNECTED: "notification.connected",
  CREATED: "notification.created",
  READ: "notification.read",
  READ_ALL: "notification.read_all",
  DELETED: "notification.deleted",
  UNREAD_COUNT: "notification.unread_count",
  HEARTBEAT: "notification.heartbeat",
  DONATION_SUCCESSFUL: "donation.successful",
});

export const REALTIME_NOTIFICATION_TYPES = Object.freeze({
  HELP_REQUEST_ASSIGNED: "help_request_assigned",
  HELP_REQUEST_REASSIGNED: "help_request_reassigned",
  HELP_REQUEST_VERIFIED: "help_request_verified",
  HELP_REQUEST_REJECTED: "help_request_rejected",
  HELP_REQUEST_COMPLETED: "help_request_completed",
  HELP_REQUEST_ASSIGNMENT_RESPONDED: "help_request_assignment_responded",

  ORGANIZER_REQUEST_UPDATED: "organizer_request_updated",
  ORGANIZER_REQUEST_SUBMITTED: "organizer_request_submitted",

  PROJECT_UPDATED: "project_updated",
  PROJECT_APPROVED: "project_approved",
  PROJECT_REJECTED: "project_rejected",
  PROJECT_REVISION_REQUESTED: "project_revision_requested",
  PROJECT_REVIEW_SUBMITTED_TO_ADMINS: "project_review_submitted_to_admins",
  PROJECT_RESUBMITTED_FOR_APPROVAL: "project_resubmitted_for_approval",
  PROJECT_AI_REVIEW_COMPLETED: "project_ai_review_completed",
  PROJECT_AI_REVIEW_FAILED: "project_ai_review_failed",

  DONATION_SUCCESSFUL: "donation_successful",
  REFUND_REQUEST_SUBMITTED: "refund_request_submitted",
  TRANSACTION_FAILED: "transaction_failed",
  TRANSACTION_REFUNDED: "transaction_refunded",
  REFUND_REQUEST_REJECTED: "refund_request_rejected",

  VOLUNTEER_APPLIED: "volunteer_applied",
  VOLUNTEER_APPLICATION_APPROVED: "volunteer_application_approved",
  VOLUNTEER_APPLICATION_REJECTED: "volunteer_application_rejected",

  VOLUNTEER_WITHDRAW_REQUESTED: "volunteer_withdraw_requested",
  VOLUNTEER_WITHDRAW_APPROVED: "volunteer_withdraw_approved",
  VOLUNTEER_WITHDRAW_REJECTED: "volunteer_withdraw_rejected",
});

export const HELP_REQUEST_REALTIME_TYPES = Object.freeze([
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_ASSIGNED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_REASSIGNED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_VERIFIED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_REJECTED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_COMPLETED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_ASSIGNMENT_RESPONDED,
]);

export const VOLUNTEER_REALTIME_TYPES = Object.freeze([
  REALTIME_NOTIFICATION_TYPES.VOLUNTEER_APPLIED,
  REALTIME_NOTIFICATION_TYPES.VOLUNTEER_APPLICATION_APPROVED,
  REALTIME_NOTIFICATION_TYPES.VOLUNTEER_APPLICATION_REJECTED,
  REALTIME_NOTIFICATION_TYPES.VOLUNTEER_WITHDRAW_REQUESTED,
  REALTIME_NOTIFICATION_TYPES.VOLUNTEER_WITHDRAW_APPROVED,
  REALTIME_NOTIFICATION_TYPES.VOLUNTEER_WITHDRAW_REJECTED,
]);