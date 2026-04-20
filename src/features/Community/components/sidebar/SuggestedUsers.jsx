import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import {
  useSuggestedUsers,
  useFollowStatus,
  useFollowMutations,
} from "../../hooks/useFollow";
import { useAuthStore } from "../../../auth/stores/useAuthStore";
import { cn } from "@/shared/components/ui/Button/Button";

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

  // Hàm hiển thị huy hiệu theo cấp độ KYC (ĐÃ ĐIỀU CHỈNH)
  const renderKycBadge = (tier) => {
    let config = {
      iconColor: "text-slate-400",
      label: "Cấp 1",
      bgColor: "bg-slate-100",
      textColor: "text-slate-600",
    };

    if (tier === 3) {
      config = {
        iconColor: "text-blue-500",
        label: "Cấp 3",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
      };
    } else if (tier === 2) {
      config = {
        iconColor: "text-emerald-500",
        label: "Cấp 2",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
      };
    }

    if (!tier) return null;

    return (
      <div
        className="flex items-center gap-1 shrink-0" // shrink-0 ngăn không cho cụm này bị bóp méo
        title={`Xác thực ${config.label}`}
      >
        <BadgeCheck className={`${config.iconColor} shrink-0`} size={14} />
        <span
          className={cn(
            // whitespace-nowrap: Cấm rớt dòng
            // Giảm px, py để nhãn thon gọn hơn
            "whitespace-nowrap text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-tight",
            config.bgColor,
            config.textColor,
          )}
        >
          {config.label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {" "}
      {/* Thêm gap-2 ở đây để cách xa nút Theo dõi */}
      <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
        {" "}
        {/* min-w-0 cực kỳ quan trọng để text-truncate hoạt động */}
        {/* Avatar giữ nguyên */}
        {user.avatar ? (
          <Link
            to={`/users/${user._id}`}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 block hover:opacity-80 transition-opacity border border-slate-100"
            style={{ backgroundImage: `url("${user.avatar}")` }}
            title={`Xem trang của ${displayName}`}
          />
        ) : (
          <Link
            to={`/users/${user._id}`}
            className="bg-amber-100 text-amber-700 font-bold flex items-center justify-center rounded-full size-10 shrink-0 text-sm hover:opacity-80 transition-opacity border border-amber-200/50"
            title={`Xem trang của ${displayName}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </Link>
        )}
        {/* Thông tin Tổ chức (ĐÃ ĐIỀU CHỈNH) */}
        <div className="flex flex-col min-w-0 justify-center">
          <Link
            to={`/users/${user._id}`}
            className="text-slate-900 text-sm font-bold truncate hover:text-amber-600 transition-colors block w-full"
            title={`Xem trang của ${displayName}`}
          >
            {displayName}
          </Link>

          {/* Hàng thông tin phụ: Nhãn KYC + Số dự án */}
          {/* flex-wrap để nếu màn hình quá hẹp thì rớt chữ "4 dự án" xuống chứ không làm biến dạng nhãn KYC */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap w-full overflow-hidden">
            {renderKycBadge(user.kyc?.tier)}

            {user.kyc?.tier && (
              <span className="text-slate-300 text-[10px] shrink-0">•</span>
            )}

            <p className="text-slate-500 text-[11px] truncate min-w-0">
              {user.projectCount > 0
                ? `${user.projectCount} dự án`
                : "Mới tham gia"}
            </p>
          </div>
        </div>
      </div>
      {/* Nút Follow giữ nguyên */}
      <button
        onClick={handleToggleFollow}
        disabled={follow.isPending || unfollow.isPending || isLoading}
        className={`font-bold text-xs px-3.5 py-1.5 rounded-full transition-all disabled:opacity-50 shrink-0 ${
          isFollowing
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
            : "bg-amber-50 text-amber-600 hover:bg-amber-100"
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
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="size-10 rounded-full bg-slate-100 animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse"></div>
              <div className="h-2 w-1/3 bg-slate-50 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !usersData) return null;

  const users = Array.isArray(usersData) ? usersData : usersData.users || [];
  const filteredUsers = users.filter(
    (u) => u._id !== (currentUser?._id || currentUser?.id),
  );

  if (filteredUsers.length === 0)
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center text-sm text-slate-500">
        Chưa có tổ chức nào để gợi ý
      </div>
    );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Tổ chức nổi bật
        </h3>
      </div>
      <div className="space-y-5">
        {filteredUsers.map((user) => (
          <UserItem key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
