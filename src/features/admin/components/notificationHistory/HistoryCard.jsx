import { useState } from "react";
import { CalendarDays, History, User } from "lucide-react";
import RecipientAudienceBlock from "./RecipientAudienceBlock";
import MetadataBlock from "./MetadataBlock";
import RecipientsPreviewCard from "./RecipientsPreviewCard";
import RecipientsDetailsModal from "./RecipientsDetailsModal";
import {
  formatLogDate,
  normalizeHistoryItem,
} from "../../utils/adminNotificationHistory.utils";

function SeverityBadge({ severity }) {
  const normalized = String(severity || "info").toLowerCase();

  const classMap = {
    info: "border-sky-200 bg-sky-50 text-sky-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    error: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
        classMap[normalized] || classMap.info
      }`}
    >
      {normalized}
    </span>
  );
}

function TargetBadge({ targetType }) {
  const normalized = String(targetType || "all").toLowerCase();

  const labels = {
    all: "Tất cả người dùng",
    custom: "Người nhận tùy chỉnh",
  };

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
      {labels[normalized] || normalized}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value || "--"}
      </p>
    </div>
  );
}

function NotificationContentBlock({ title, message, severity, createdAt }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={severity} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
          <CalendarDays size={12} />
          {formatLogDate(createdAt)}
        </span>
      </div>

      <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
        {title || "Không có tiêu đề"}
      </h3>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Nội dung tin nhắn
        </p>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
          {message || "--"}
        </p>
      </div>
    </div>
  );
}

function SenderBlock({ actorName, actorEmail, actorRole }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <User size={16} className="text-slate-500" />
        <h4 className="text-sm font-black tracking-tight text-slate-900">
          Thông tin người gửi
        </h4>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoRow label="Tên quản trị viên" value={actorName || "Quản trị viên"} />
        <InfoRow label="Email" value={actorEmail || "--"} />
        <InfoRow label="Vai trò" value={actorRole || "--"} />
      </div>
    </div>
  );
}

export default function HistoryCard({ item }) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);

  const {
    title,
    message,
    severity,
    targetType,
    actorName,
    actorEmail,
    actorRole,
    roles,
    roleSelections,
    requestedUsers,
    resolvedRecipientCount,
    resolvedRecipientIds,
    resolvedRecipients,
    resolutionBreakdown,
  } = normalizeHistoryItem(item);

  const requestedUserIds = requestedUsers.map((user) => user._id);

  return (
    <>
      <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={severity} />
          <TargetBadge targetType={targetType} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
            <History size={12} />
            Bản ghi nhật ký
          </span>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <NotificationContentBlock
              title={title}
              message={message}
              severity={severity}
              createdAt={item?.createdAt}
            />

            <SenderBlock
              actorName={actorName}
              actorEmail={actorEmail}
              actorRole={actorRole}
            />
          </div>

          <div className="space-y-4">
            <RecipientAudienceBlock
              targetType={targetType}
              roles={roles}
              roleSelections={roleSelections}
              resolvedRecipientCount={resolvedRecipientCount}
              resolutionBreakdown={resolutionBreakdown}
            />

            <RecipientsPreviewCard
              requestedUsers={requestedUsers}
              resolvedRecipients={resolvedRecipients}
              resolvedRecipientCount={resolvedRecipientCount}
              onOpen={() => setShowRecipientsModal(true)}
            />

            <MetadataBlock
              item={item}
              isExpanded={showMetadata}
              onToggle={() => setShowMetadata((prev) => !prev)}
            />
          </div>
        </div>
      </article>

      <RecipientsDetailsModal
        open={showRecipientsModal}
        onClose={() => setShowRecipientsModal(false)}
        requestedUsers={requestedUsers}
        resolvedRecipients={resolvedRecipients}
        userIds={requestedUserIds}
        resolvedRecipientIds={resolvedRecipientIds}
      />
    </>
  );
}