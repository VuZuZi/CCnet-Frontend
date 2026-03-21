import React from "react";

const FeedNav = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
      <nav className="p-2 flex flex-col gap-1">
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-50 text-yellow-700"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px] font-bold">
            explore
          </span>
          <span className="text-sm font-semibold">Explore</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">group</span>
          <span className="text-sm font-medium">Following</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">
            bookmark
          </span>
          <span className="text-sm font-medium">Saved</span>
        </a>
      </nav>
    </div>
  );
};

export default FeedNav;
