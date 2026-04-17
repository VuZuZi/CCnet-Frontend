export default function SeenAvatars({
  users = [],
  status = 'sent',
}) {
  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];

  if (!safeUsers.length) {
    return status === 'sent' || status === 'delivered' ? (
      <span className="text-[11px] font-medium text-slate-500">
        Đã gửi
      </span>
    ) : null;
  }

  return (
    <div className="flex items-center justify-end -space-x-1.5">
      {safeUsers.slice(0, 5).map((user, index) => {
        const id = String(user?._id || user?.id || user?.userId || index);
        const avatar =
          user?.avatar ||
          user?.userId?.avatar ||
          user?.photoURL ||
          '';
        const name =
          user?.fullName ||
          user?.userId?.fullName ||
          user?.name ||
          user?.email ||
          'Người dùng';

        return avatar ? (
          <img
            key={id}
            src={avatar}
            alt={name}
            title={name}
            className="h-[18px] w-[18px] rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <div
            key={id}
            title={name}
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-700 ring-2 ring-white"
          >
            {String(name).slice(0, 1).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}