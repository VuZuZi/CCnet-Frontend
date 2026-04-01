import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function ProjectCard({ project, viewMode = 'grid' }) {
  const { t } = useTranslation();
  const progressPercent = project.targetAmount > 0
    ? Math.min(Math.round((project.currentAmount / project.targetAmount) * 100), 100)
    : 0;

  const now = new Date();
  const endDate = project.endDate ? new Date(project.endDate) : null;
  const daysLeft = endDate
    ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const getCategoryStyles = (cat) => {
    const styles = {
      Y_TE: "bg-card-blue-bg text-blue-800",
      GIAO_DUC: "bg-card-purple-bg text-purple-800",
      MOI_TRUONG: "bg-card-green-bg text-green-800",
      THIEN_TAI: "bg-red-50 text-red-800",
      XAY_DUNG: "bg-card-yellow-bg text-amber-800",
    };
    return styles[cat] || 'bg-slate-100 text-slate-800';
  };

  const getProgressBarColor = (cat) => {
    const styles = {
      'Y_TE': 'bg-blue-500',
      'GIAO_DUC': 'bg-purple-500',
      'MOI_TRUONG': 'bg-green-500',
      'THIEN_TAI': 'bg-red-500',
      'XAY_DUNG': 'bg-amber-500',
    };
    return styles[cat] || 'bg-amber-500';
  };

  const catStyle = getCategoryStyles(project.category);
  const barStyle = getProgressBarColor(project.category);

  const containerClass =
    viewMode === 'list'
      ? 'bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row hover:shadow-md transition-shadow'
      : 'bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow';

  const imageClass =
    viewMode === 'list'
      ? 'h-44 md:h-auto md:w-64 bg-slate-200 relative group overflow-hidden flex-shrink-0'
      : 'h-48 bg-slate-200 relative group overflow-hidden';

  return (
    <div className={containerClass}>
      <div className={imageClass}>
        <img
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={project.coverMedia?.url || 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80'}
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${catStyle}`}>
            {t(`project.categories.${project.category || 'KHAC'}`)}
          </span>
          {project.isUrgent && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              {t('common.urgent')}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-slate-500">
            {t('project.by')} {project.organizerId?.fullName || t('project.anonymous_organizer')}
          </span>
          {project.organizerId?.isVerified && (
            <BadgeCheck className="text-blue-500" size={16} title={t('project.verified_organizer')} />
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight line-clamp-2">
          {project.title}
        </h3>

        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
          <MapPin size={16} />
          <span className="truncate">{project.location?.address || t('common.noLocation')}</span>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span className="text-slate-900">
              {Number(project.currentAmount || 0).toLocaleString()}đ{' '}
              <span className="text-xs font-normal text-slate-500">{t('project.raised')}</span>
            </span>
            <span className="text-slate-500 text-xs font-normal">
              {t('project.of_target', { amount: Number(project.targetAmount || 0).toLocaleString() })}
            </span>
          </div>

          <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
            <span>{progressPercent}%</span>
            {daysLeft !== null && <span>{t('project.days_left', { count: daysLeft })}</span>}
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
            <div className={`h-full ${barStyle} rounded-full`} style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Link
              to={`/projects/${project._id}`}
              className="py-2 px-4 text-sm font-bold text-black bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-sm w-full text-center"
            >
              {t('project.view_details')}
            </Link>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sharedData={shareData}
        initialText={`Dự án tuyệt vời: "${project.title}". Mọi người cùng chung tay nhé! `}
      />
    </>
  );
}
