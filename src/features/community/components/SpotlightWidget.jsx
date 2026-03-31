import React from "react";

const SpotlightWidget = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-red-50 flex items-center gap-2">
        <span className="material-symbols-outlined text-red-600 text-[20px]">
          campaign
        </span>
        <span className="text-red-700 font-bold text-xs uppercase">
          Urgent Need
        </span>
      </div>
      <div className="p-5">
        <div
          className="w-full aspect-video rounded-xl mb-4 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBAPrx0ptYxEBKyEuvLg9ci-tQBbAf5DaFXDO9yms932cDykYgtnZylmcslwgsVUuM7N5pauiQ66myUaGGK5wVFNjE5kp4eO-OzOiSiuJr_toMoxMP2A-zLwy9-2xYec46G0UpdXKTtvSMH0635oyM6QUHNOZQieX3YyDoWcItugpif3MMcJQSjA_-6iuP7yNEdHLqC3AjEsyUUUdu_d6Xec_NWzadOkjuZBIF70jtqpnBZrnTqC7xRkfeC-X6SUSwXGJNwF_XUBFxz")',
          }}
        ></div>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase">
          Health
        </span>
        <h4 className="text-slate-900 font-bold text-sm mt-2">
          Mobile Clinic Africa
        </h4>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span className="text-slate-500">Raised: $12,400</span>
            <span className="text-primary">80%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[80%] rounded-full"></div>
          </div>
        </div>
        <button className="w-full mt-4 bg-primary text-white text-xs font-bold py-2 rounded-xl hover:bg-yellow-500 transition-colors">
          Donate Now
        </button>
      </div>
    </div>
  );
};

export default SpotlightWidget;
