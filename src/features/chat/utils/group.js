import { getEntityId } from './id';

export function getUserId(user) {
  return getEntityId(user);
}

export function getMemberName(member) {
  return (
    member?.fullName ||
    member?.username ||
    member?.email ||
    member?.name ||
    member?.user?.fullName ||
    member?.user?.username ||
    member?.user?.email ||
    member?.user?.name ||
    'Thành viên'
  );
}

export function buildUniqueUsers(conversations = [], myId = '', excludeUsers = []) {
  const excludeSet = new Set(
    (excludeUsers || []).map((item) => String(getUserId(item)))
  );

  const map = new Map();

  for (const convo of conversations) {
    const participants = Array.isArray(convo?.participants) ? convo.participants : [];

    for (const user of participants) {
      const uid = getUserId(user);
      if (!uid || uid === String(myId) || excludeSet.has(uid)) continue;

      if (!map.has(uid)) {
        map.set(uid, {
          _id: uid,
          fullName: user?.fullName || user?.user?.fullName || '',
          email: user?.email || user?.user?.email || '',
          avatar: user?.avatar || user?.user?.avatar || '',
          username: user?.username || user?.user?.username || '',
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    String(a.fullName || a.email || a.username).localeCompare(
      String(b.fullName || b.email || b.username),
      'vi'
    )
  );
}

export function filterUsers(users = [], keyword = '') {
  const q = String(keyword || '').trim().toLowerCase();
  if (!q) return users;

  return users.filter((user) => {
    const fullName = String(user?.fullName || '').toLowerCase();
    const email = String(user?.email || '').toLowerCase();
    const username = String(user?.username || '').toLowerCase();

    return (
      fullName.includes(q) ||
      email.includes(q) ||
      username.includes(q)
    );
  });
}