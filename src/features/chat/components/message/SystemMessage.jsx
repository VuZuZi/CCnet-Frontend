function normalizeId(value) {
  if (!value) return '';

  if (typeof value === 'string') return String(value);

  return String(
    value?._id ||
      value?.id ||
      value?.userId?._id ||
      value?.userId ||
      value?.readerId?._id ||
      value?.readerId ||
      value?.user?._id ||
      value?.user?.id ||
      value ||
      ''
  );
}

function getDisplayName(userLike) {
  if (!userLike) return 'Thành viên';

  return (
    userLike.fullName ||
    userLike.username ||
    userLike.email ||
    userLike.name ||
    userLike.user?.fullName ||
    userLike.user?.username ||
    userLike.user?.email ||
    userLike.user?.name ||
    'Thành viên'
  );
}

function includesUser(targetUserIds = [], currentUserId) {
  const myId = String(currentUserId || '');
  if (!myId) return false;

  return (Array.isArray(targetUserIds) ? targetUserIds : []).some(
    (item) => normalizeId(item) === myId
  );
}

function extractQuotedName(rawText = '') {
  const match = String(rawText).match(/"([^"]+)"/);
  return match?.[1] || '';
}

function buildSystemMessageText(message, currentUserId) {
  const rawText = String(message?.text || '').trim();
  const action = String(message?.meta?.action || '');
  const actor = message?.meta?.actorId || null;
  const targetUserIds = Array.isArray(message?.meta?.targetUserIds)
    ? message.meta.targetUserIds
    : [];

  const actorName = getDisplayName(actor);
  const isMeTarget = includesUser(targetUserIds, currentUserId);
  const isMeActor = normalizeId(actor) === String(currentUserId || '');

  if (action === 'member_added') {
    if (isMeTarget) {
      if (isMeActor) return 'Bạn đã tự thêm mình vào nhóm';
      if (actorName && actorName !== 'Thành viên') {
        return `Bạn đã được ${actorName} thêm vào nhóm`;
      }
      return 'Bạn đã được thêm vào nhóm';
    }

    return rawText || 'Một thành viên đã được thêm vào nhóm';
  }

  if (action === 'member_removed') {
    if (isMeTarget) {
      if (actorName && actorName !== 'Thành viên') {
        return `Bạn đã bị ${actorName} xóa khỏi nhóm`;
      }
      return 'Bạn đã bị xóa khỏi nhóm';
    }

    return rawText || 'Một thành viên đã bị xóa khỏi nhóm';
  }

  if (action === 'member_left') {
    if (isMeActor) {
      return 'Bạn đã rời nhóm';
    }

    return rawText || `${actorName} đã rời nhóm`;
  }

  if (action === 'admin_transferred') {
    if (isMeTarget) {
      return 'Bạn đã được chuyển quyền trưởng nhóm';
    }

    return rawText || 'Quyền trưởng nhóm đã được chuyển';
  }

  if (action === 'group_name_updated') {
    const nextName = extractQuotedName(rawText);

    if (isMeActor) {
      return nextName
        ? `Bạn đã đổi tên nhóm thành "${nextName}"`
        : 'Bạn đã đổi tên nhóm';
    }

    if (actorName && actorName !== 'Thành viên') {
      return nextName
        ? `${actorName} đã đổi tên nhóm thành "${nextName}"`
        : `${actorName} đã đổi tên nhóm`;
    }

    return rawText || 'Tên nhóm đã được cập nhật';
  }

  return rawText || 'Thông báo hệ thống';
}

export default function SystemMessage({
  message,
  currentUserId,
}) {
  const text = buildSystemMessageText(message, currentUserId);

  return (
    <div className="my-4 flex justify-center">
      <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
        {text}
      </div>
    </div>
  );
}