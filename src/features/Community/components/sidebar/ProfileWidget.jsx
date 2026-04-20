import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../auth/stores/useAuthStore";

const ProfileWidget = () => {
  const { user } = useAuthStore();

  const fullName = user?.fullName || user?.username || "Khách";
  const userInitial = fullName.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={fullName}
            className="size-12 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
          />
        ) : (
          <div className="size-12 rounded-full bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center shrink-0 ring-2 ring-yellow-50 text-lg">
            {userInitial}
          </div>
        )}

        <div className="flex flex-col">
          <h1 className="text-slate-900 text-base font-bold leading-tight">
            {fullName}
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            {user?.role || "Người dùng"}
          </p>
        </div>
      </div>
      <Link
        to="/profile"
        className="block w-full mt-4 bg-primary text-white text-center text-sm font-bold py-2.5 rounded-xl hover:bg-yellow-500 transition-all"
      >
        Xem hồ sơ
      </Link>
    </div>
  );
};

export default ProfileWidget;
