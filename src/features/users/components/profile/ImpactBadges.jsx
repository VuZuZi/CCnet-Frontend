export function ImpactBadges() {
  return (
    <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-purpose="achievements-section">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        My Impact Badges
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">8 Earned</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="hover:-translate-y-1 transition-transform p-4 rounded-xl bg-green-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 mb-2 flex items-center justify-center text-2xl">🌱</div>
          <span className="text-sm font-bold text-green-800">Seed Planter</span>
        </div>
        <div className="hover:-translate-y-1 transition-transform p-4 rounded-xl bg-blue-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 mb-2 flex items-center justify-center text-2xl">💧</div>
          <span className="text-sm font-bold text-blue-800">Water Hero</span>
        </div>
        <div className="hover:-translate-y-1 transition-transform p-4 rounded-xl bg-orange-100 flex flex-col items-center text-center opacity-90">
          <div className="w-12 h-12 mb-2 flex items-center justify-center text-2xl">🤝</div>
          <span className="text-sm font-bold text-orange-800">Team Player</span>
        </div>
        <div className="hover:-translate-y-1 transition-transform p-4 rounded-xl bg-purple-100 flex flex-col items-center text-center opacity-90">
          <div className="w-12 h-12 mb-2 flex items-center justify-center text-2xl">📦</div>
          <span className="text-sm font-bold text-purple-800">Logistics Pro</span>
        </div>
      </div>
    </article>
  );
}