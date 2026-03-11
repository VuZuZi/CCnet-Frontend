export function ImpactMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-purpose="metrics-grid">
      <div className="bg-[#fef3c7] p-6 rounded-2xl flex flex-col justify-center">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">High Trust</span>
        <span className="text-3xl font-extrabold text-amber-900">850 pts</span>
      </div>
      <div className="bg-[#dcfce7] p-6 rounded-2xl flex flex-col justify-center">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">Total Supported</span>
        <span className="text-3xl font-extrabold text-emerald-900">12 projects</span>
      </div>
      <div className="bg-[#e0f2fe] p-6 rounded-2xl flex flex-col justify-center">
        <span className="text-xs font-bold text-sky-800 uppercase tracking-widest mb-1">Time Donated</span>
        <span className="text-3xl font-extrabold text-sky-900">45h</span>
      </div>
    </div>
  );
}