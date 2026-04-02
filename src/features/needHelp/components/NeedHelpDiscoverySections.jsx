import {
  Activity,
  Droplets,
  HandHeart,
  HousePlus,
  School,
  Siren,
  Trees,
} from 'lucide-react';

const CATEGORY_TILES = [
  {
    value: 'Y_TE',
    label: 'Medical Aid',
    icon: Activity,
    description: 'Support treatments, medicine and emergency care.',
    tone: 'from-rose-100 to-pink-50 text-rose-700 border-rose-200/70',
  },
  {
    value: 'GIAO_DUC',
    label: 'Education',
    icon: School,
    description: 'Scholarships, learning tools and school access.',
    tone: 'from-blue-100 to-sky-50 text-blue-700 border-blue-200/70',
  },
  {
    value: 'THIEN_TAI',
    label: 'Disaster Relief',
    icon: Siren,
    description: 'Rapid response for storms, floods and emergencies.',
    tone: 'from-orange-100 to-amber-50 text-orange-700 border-orange-200/70',
  },
  {
    value: 'XAY_DUNG',
    label: 'Construction',
    icon: HousePlus,
    description: 'Rebuild homes, schools and community facilities.',
    tone: 'from-slate-200 to-slate-100 text-slate-700 border-slate-300/80',
  },
  {
    value: 'MOI_TRUONG',
    label: 'Environment',
    icon: Trees,
    description: 'Protect natural areas and reduce local pollution.',
    tone: 'from-emerald-100 to-green-50 text-emerald-700 border-emerald-200/70',
  },
];

const PRIORITY_TILES = [
  {
    key: 'critical',
    title: 'Urgent Cases',
    description: 'Show requests needing immediate support.',
    icon: Droplets,
    onPick: { type: 'urgency', value: 'CRITICAL' },
    tone: 'from-rose-500 to-orange-500',
  },
  {
    key: 'high',
    title: 'High Priority',
    description: 'Focus on requests with major impact potential.',
    icon: HandHeart,
    onPick: { type: 'urgency', value: 'HIGH' },
    tone: 'from-amber-500 to-orange-500',
  },
  {
    key: 'all',
    title: 'Browse All',
    description: 'Reset filters and explore every open request.',
    icon: Activity,
    onPick: { type: 'reset' },
    tone: 'from-slate-700 to-slate-900',
  },
];

export function NeedHelpDiscoverySections({ onFilterChange, onResetFilters, onJumpToList }) {
  const handleCategoryPick = (category) => {
    onFilterChange('category', category);
    onJumpToList?.();
  };

  const handlePriorityPick = (pick) => {
    if (pick.type === 'reset') {
      onResetFilters();
      onJumpToList?.();
      return;
    }

    if (pick.type === 'urgency') {
      onFilterChange('urgencyLevel', pick.value);
      onJumpToList?.();
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Explore Need Categories</h2>
            <p className="mt-1 text-sm text-slate-500">
              Jump straight into the type of request where you want to help first.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {CATEGORY_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.value}
                type="button"
                onClick={() => handleCategoryPick(tile.value)}
                className={`group rounded-2xl border bg-gradient-to-br px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${tile.tone}`}
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/75">
                  <Icon size={18} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{tile.label}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{tile.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {PRIORITY_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => handlePriorityPick(tile.onPick)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r p-5 text-left text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${tile.tone}`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
              <div className="relative">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Icon size={18} />
                </div>
                <h3 className="mt-3 text-base font-bold">{tile.title}</h3>
                <p className="mt-1 text-sm text-white/85">{tile.description}</p>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
