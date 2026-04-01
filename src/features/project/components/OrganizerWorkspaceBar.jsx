import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, ArrowRight, PlusCircle } from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { ROLES } from '@/shared/constants/roles';
import { LanguageSwitcher } from '@/i18n/components/LanguageSwitcher';

export function OrganizerWorkspaceBar() {
  const { t } = useTranslation();
  const userRole = useAuthStore(authSelectors.userRole);

  if (userRole !== ROLES.ORGANIZER) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl mb-8 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-slate-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-xl">
          <LayoutDashboard size={20} className="text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{t('workspace.bar_title')}</h3>
          <p className="text-xs text-slate-400">{t('workspace.bar_subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="mr-2">
          <LanguageSwitcher />
        </div>
        <Link
          to="/projects/create"
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold rounded-xl transition-colors shadow-sm shadow-amber-500/20"
        >
          <PlusCircle size={16} /> {t('workspace.create_project')}
        </Link>
        <Link
          to="/workspace/projects"
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {t('workspace.enter_workspace')} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}