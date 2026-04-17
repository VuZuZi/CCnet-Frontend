import React from "react";
import { Link } from "react-router-dom"; // THÊM: Import Link để điều hướng
import {
  useSuggestedUsers,
  useFollowStatus,
  useFollowMutations,
} from "../../hooks/useFollow";
import { useAuthStore } from "../../../auth/stores/useAuthStore";

const UserItem = ({ user }) => {
  const { data: statusRes, isLoading } = useFollowStatus(user._id);
  const { follow, unfollow } = useFollowMutations();
  const isFollowing = statusRes?.isFollowing || false;

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollow.mutate(user._id);
    } else {
      follow.mutate(user._id);
    }
  };

  const displayName = user.fullName || user.username || "U";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* 👇 THAY DIV BẰNG LINK CHO AVATAR 👇 */}
        {user.avatar ? (
          <Link
            to={`/users/${user._id}`}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0 block hover:opacity-80 transition-opacity"
            style={{ backgroundImage: `url("${user.avatar}")` }}
            title={`Xem trang cá nhân của ${displayName}`}
          />
        ) : (
          <Link
            to={`/users/${user._id}`}
            className="bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center rounded-full size-8 shrink-0 text-xs hover:opacity-80 transition-opacity"
            title={`Xem trang cá nhân của ${displayName}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </Link>
        )}

        {/* 👇 THAY P BẰNG LINK CHO TÊN NGƯỜI DÙNG 👇 */}
        <div className="flex flex-col">
          <Link
            to={`/users/${user._id}`}
            className="text-slate-900 text-xs font-bold line-clamp-1 hover:underline"
            title={`Xem trang cá nhân của ${displayName}`}
          >
            {displayName}
          </Link>
          <p className="text-slate-400 text-[10px] line-clamp-1">
            {user.role || "Thành viên"}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggleFollow}
        disabled={follow.isPending || unfollow.isPending || isLoading}
        className={`font-bold text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 shrink-0 ml-2 ${
          isFollowing
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
            : "text-primary hover:bg-yellow-50"
        }`}
      >
        {isLoading || follow.isPending || unfollow.isPending
          ? "..."
          : isFollowing
            ? "Đang theo dõi"
            : "Theo dõi"}
      </button>
    </div>
  );
};

const SuggestedUsers = () => {
  const { user: currentUser } = useAuthStore();
  const { data: usersData, isLoading, isError } = useSuggestedUsers(5);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center text-sm text-slate-400 animate-pulse">
        Đang tải gợi ý...
      </div>
    );
  }

  if (isError || !usersData) return null;

  const users = Array.isArray(usersData) ? usersData : usersData.users || [];
  const filteredUsers = users.filter(
    (u) => u._id !== (currentUser?._id || currentUser?.id),
  );

  if (filteredUsers.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
        Gợi ý cho bạn
      </h3>
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <UserItem key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
