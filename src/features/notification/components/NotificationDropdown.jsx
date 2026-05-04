import { Settings, Sparkles } from "lucide-react";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import NotificationList from "./NotificationList";

const PROJECT_DECISION_TYPES = new Set([
  "project_approved",
  "project_rejected",
  "project_revision_requested",
  "project_updated",
]);

function getProjectId(item) {
  return (
    item?.metadata?.projectId ||
    item?.metadata?.project ||
    item?.projectId ||
    item?.entityId ||
    ""
  );
}

function getDecisionStatus(item) {
  const type = String(item?.type || "").toLowerCase();
  const status = String(item?.metadata?.status || "").toUpperCase();
  const decision = String(item?.metadata?.decision || "").toUpperCase();

  if (type === "project_approved") return "APPROVED";
  if (type === "project_rejected") return "REJECTED";
  if (type === "project_revision_requested") return "REVISION_REQUESTED";

  if (status === "FUNDING" || status === "RECRUITING" || status === "APPROVED") {
    return "APPROVED";
  }

  if (status === "REJECTED" || decision === "REJECTED") {
    return "REJECTED";
  }

  if (
    status === "REVISION_REQUESTED" ||
    decision === "REVISION_REQUESTED"
  ) {
    return "REVISION_REQUESTED";
  }

  return "";
}

function getFeedbackText(item) {
  const metadata = item?.metadata || {};

  return (
    metadata.feedback ||
    metadata.reason ||
    metadata.rejectReason ||
    metadata.reviewNote ||
    metadata.withdrawReason ||
    metadata.rejectionReason ||
    metadata.adminFeedback ||
    metadata.decisionFeedback ||
    ""
  );
}

function getNotificationTime(item) {
  const raw = item?.createdAt || item?.created_at || item?.timestamp;
  const time = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function getDuplicateKey(item) {
  const type = String(item?.type || "").toLowerCase();

  if (!PROJECT_DECISION_TYPES.has(type)) {
    return "";
  }

  const projectId = getProjectId(item);
  const decisionStatus = getDecisionStatus(item);

  if (!projectId || !decisionStatus) {
    return "";
  }

  return `project:${projectId}:${decisionStatus}`;
}

function scoreNotification(item) {
  let score = 0;

  const type = String(item?.type || "").toLowerCase();
  const feedback = getFeedbackText(item);

  if (feedback) score += 100;

  if (
    type === "project_approved" ||
    type === "project_rejected" ||
    type === "project_revision_requested"
  ) {
    score += 50;
  }

  score += getNotificationTime(item) / 10000000000000;

  return score;
}

function dedupeProjectDecisionNotifications(items = []) {
  if (!Array.isArray(items)) return [];

  const selectedByKey = new Map();
  const passthrough = [];

  items.forEach((item) => {
    const duplicateKey = getDuplicateKey(item);

    if (!duplicateKey) {
      passthrough.push(item);
      return;
    }

    const existing = selectedByKey.get(duplicateKey);

    if (!existing || scoreNotification(item) > scoreNotification(existing)) {
      selectedByKey.set(duplicateKey, item);
    }
  });

  const selected = Array.from(selectedByKey.values());

  return [...passthrough, ...selected].sort(
    (a, b) => getNotificationTime(b) - getNotificationTime(a),
  );
}

export default function NotificationDropdown({
  isOpen,
  items,
  unreadCount,
  isLoading,
  onMarkAllRead,
  onRead,
  onDelete,
  onClose,
  onOpenSettings,
}) {
  const user = useAuthStore(authSelectors.user);
  const role = String(user?.role || "").toLowerCase();
  const canManageSettings = role === "user" || role === "organizer";

  const visibleItems = dedupeProjectDecisionNotifications(items);
  const visibleUnreadCount = visibleItems.filter((item) => !item?.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 slide-in-from-top-2 z-50 w-full overflow-hidden rounded-[24px] border border-[#FBBF24]/70 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl duration-200">
      <div className="border-b border-[#FBBF24] bg-[#FBBF24] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-[#FBBF24] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">
              <Sparkles size={10} />
              Trung tâm thông báo
            </div>

            <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900">
              Thông báo
            </h3>

            <p className="mt-0.5 text-[11px] font-semibold text-slate-800">
              {visibleUnreadCount} chưa đọc
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManageSettings ? (
              <button
                type="button"
                title="Cài đặt thông báo"
                aria-label="Cài đặt thông báo"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenSettings?.();
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white text-slate-900 shadow-sm transition-all duration-200 hover:bg-white"
              >
                <Settings size={16} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="rounded-xl border border-white/60 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-900 shadow-sm transition-all duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              Đánh dấu đã đọc
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="px-5 py-10 text-center text-sm font-medium text-slate-500">
          Đang tải thông báo...
        </div>
      ) : (
        <div className="max-h-[460px] overflow-y-auto bg-white">
          <NotificationList
            items={visibleItems}
            onRead={onRead}
            onDelete={onDelete}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
}