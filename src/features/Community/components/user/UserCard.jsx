import React from "react";
import { Button } from "@/shared/components/ui/Button/Button";

export const UserCard = ({
  user,
  isFollowingTab,
  onRequestUnfollow,
  onGoUser,
}) => {
  const title = user.fullName || user.email || "Người ẩn danh";
  const letter = String(title).trim().slice(0, 1).toUpperCase();

  return (
    <div
      className="bg-white rounded-[14px] shadow-sm border border-light-gray p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_10px_18px_rgba(17,24,39,0.08)] cursor-pointer"
      onClick={() => onGoUser(user)}
      role="button"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-[#f3f4f6] flex items-center justify-center font-black text-[#111827]">
          {user.avatar ? (
            <img
              className="w-full h-full object-cover"
              src={user.avatar}
              alt={title}
            />
          ) : (
            letter
          )}
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-[#111827] truncate leading-tight mb-0.5">
            {title}
          </div>
          <div className="text-[13px] text-[#6b7280] truncate">
            {user.email || ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
        {isFollowingTab ? (
          <Button
            variant="danger"
            className="!py-1.5 !px-4 !text-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRequestUnfollow(user);
            }}
          >
            Bỏ theo dõi
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="!py-1.5 !px-4 !text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onGoUser(user);
            }}
          >
            Xem hồ sơ
          </Button>
        )}
      </div>
    </div>
  );
};
