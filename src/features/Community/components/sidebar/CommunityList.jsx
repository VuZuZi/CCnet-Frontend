import React from "react";

const CommunityList = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
        My Communities
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="size-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">eco</span>
          </div>
          <p className="text-slate-700 text-sm font-medium truncate">
            Amazon Reforestation
          </p>
        </div>
        <div className="flex items-center gap-3 px-1">
          <div className="size-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">pets</span>
          </div>
          <p className="text-slate-700 text-sm font-medium truncate">
            Animal Rescue
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityList;
