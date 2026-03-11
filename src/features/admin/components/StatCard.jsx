const StatCard = ({ title, value = 0, icon, color = "amber" }) => {
  const colorMap = {
    amber: "bg-amber-50 text-amber-600",
    yellow: "bg-yellow-100 text-yellow-700",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-amber-200 transition-all group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        </div>
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorMap[color] || colorMap.amber}`}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
      <div className="h-1 w-0 group-hover:w-full bg-amber-400 transition-all duration-500 mt-4 rounded-full" />
    </div>
  );
};

export default StatCard;
