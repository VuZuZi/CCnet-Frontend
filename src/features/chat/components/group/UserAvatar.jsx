function getAvatarSrc(user) {
  return (
    user?.avatar ||
    user?.user?.avatar ||
    user?.userId?.avatar ||
    ''
  );
}

function getUserLabel(user) {
  return (
    user?.fullName ||
    user?.user?.fullName ||
    user?.userId?.fullName ||
    user?.email ||
    user?.user?.email ||
    user?.userId?.email ||
    '?'
  );
}

export default function UserAvatar({ user, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  const avatar = getAvatarSrc(user);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={getUserLabel(user)}
        className={`${sizeClass} rounded-full border border-slate-200 object-cover`}
      />
    );
  }

  const label = String(getUserLabel(user)).trim().slice(0, 1).toUpperCase();

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-bold text-slate-700`}
    >
      {label}
    </div>
  );
}