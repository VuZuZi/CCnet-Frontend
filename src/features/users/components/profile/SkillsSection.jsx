const COLOR_VARIANTS = [
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'bg-orange-50 text-orange-700 border-orange-100',
];

export function SkillsSection({ skills = [] }) {
  if (!skills || skills.length === 0) return null; 
  return (
    <article className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100" data-purpose="skills-section">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Kỹ năng</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => {
          const colorClass = COLOR_VARIANTS[index % COLOR_VARIANTS.length];
          return (
            <span 
              key={index} 
              className={`px-2.5 py-1 rounded-md text-xs font-bold border ${colorClass}`}
            >
              {skill}
            </span>
          );
        })}
      </div>
    </article>
  );
}