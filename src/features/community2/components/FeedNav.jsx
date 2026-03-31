import React from "react";
import { Link, useLocation } from "react-router-dom";

const FeedNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col gap-1">
      <Link
        to="/community"
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive("/community") ? "text-yellow-700 bg-yellow-50 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
      >
        <span
          className={`material-symbols-outlined ${isActive("/community") ? "fill-current" : ""}`}
        >
          explore
        </span>
        Explore
      </Link>

      <Link
        to="/following"
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive("/following") ? "text-yellow-700 bg-yellow-50 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
      >
        <span
          className={`material-symbols-outlined ${isActive("/following") ? "fill-current" : ""}`}
        >
          group
        </span>
        Following
      </Link>

      <Link
        to="/saved"
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive("/saved") ? "text-yellow-700 bg-yellow-50 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
      >
        <span
          className={`material-symbols-outlined ${isActive("/saved") ? "fill-current" : ""}`}
        >
          bookmark
        </span>
        Saved
      </Link>
    </nav>
  );
};

export default FeedNav;
