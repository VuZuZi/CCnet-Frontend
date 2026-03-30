import { LayoutGrid, Search, Loader2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/i18n/components/LanguageSwitcher';

export function ProjectFilterBar({ 
  localLocation, 
  setLocalLocation, 
  filters, 
  onCategoryChange, 
  isFetching 
}) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-20 z-40 bg-slate-50/95 backdrop-blur-md py-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <LayoutGrid className="text-amber-500" size={24} /> {t('project.explore_all')}
      </h2>

      <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">

        <div className="relative flex-1 md:flex-none min-w-[220px]">
          {isFetching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" size={18} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          )}
          <input
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            placeholder={t('project.search_location')}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="relative flex-1 md:flex-none min-w-[180px]">
          <select
            value={filters.category}
            onChange={onCategoryChange}
            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium shadow-sm cursor-pointer"
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
    </div>
  );
}