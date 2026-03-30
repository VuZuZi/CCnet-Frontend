import React from "react";

const FeedNav = ({ activeFeed, onChangeFeed }) => {
  const isActive = (type) => activeFeed === type;

  return (
    <nav className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col gap-1">
      <button
        onClick={() => onChangeFeed("for-you")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
          isActive("for-you")
            ? "text-yellow-700 bg-yellow-50 font-bold"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isActive("for-you") ? "fill-current" : ""}`}
        >
          explore
        </span>
        Explore
      </button>

      <button
        onClick={() => onChangeFeed("following")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
          isActive("following")
            ? "text-yellow-700 bg-yellow-50 font-bold"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isActive("following") ? "fill-current" : ""}`}
        >
          group
        </span>
        Following
      </button>

      <button
        onClick={() => onChangeFeed("saved")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
          isActive("saved")
            ? "text-yellow-700 bg-yellow-50 font-bold"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isActive("saved") ? "fill-current" : ""}`}
        >
          bookmark
        </span>
        Saved
      </button>
    </nav>
  );
};

export default FeedNav;
