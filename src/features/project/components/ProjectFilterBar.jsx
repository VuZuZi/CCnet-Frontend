import { LayoutGrid, List, Search, Loader2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ProjectFilterBar({
  localLocation,
  setLocalLocation,
  filters,
  onCategoryChange,
  isFetching,
  viewMode,
  onViewModeChange
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4 justify-between">
      <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1">
        <div className="relative w-full md:w-80">
          {isFetching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" size={18} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          )}
          <input
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            placeholder={t('project.search_location')}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <div className="relative w-full md:w-56">
          <select
            value={filters.category}
            onChange={onCategoryChange}
            className="block w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm font-medium cursor-pointer transition-colors"
          >
            <option value="">{t('project.all_categories')}</option>
            <option value="Y_TE">{t('project.categories.Y_TE')}</option>
            <option value="GIAO_DUC">{t('project.categories.GIAO_DUC')}</option>
            <option value="MOI_TRUONG">{t('project.categories.MOI_TRUONG')}</option>
            <option value="THIEN_TAI">{t('project.categories.THIEN_TAI')}</option>
            <option value="XAY_DUNG">{t('project.categories.XAY_DUNG')}</option>
            <option value="KHAC">{t('project.categories.KHAC')}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>

      <div className="flex items-center bg-slate-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => onViewModeChange?.('grid')}
          className={`p-1.5 rounded-md shadow-sm transition-colors ${(viewMode || 'grid') === 'grid'
              ? 'bg-white text-slate-900'
              : 'text-slate-500 hover:text-slate-900'
            }`}
          title={t('project.view_grid')}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange?.('list')}
          className={`p-1.5 rounded-md transition-colors ${viewMode === 'list'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
            }`}
          title={t('project.view_list')}
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}
