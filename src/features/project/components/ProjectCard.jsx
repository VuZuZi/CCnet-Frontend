import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiTarget } from 'react-icons/fi';
import { ROUTES } from '@/shared/constants/routes';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';

export function ProjectCard({ project }) {
  const {
    projectId,
    title,
    description,
    financialGoal,
    currentAmount,
    status,
    startDate,
    endDate,
  } = project;

  const progressPercent = financialGoal > 0 
    ? Math.min((currentAmount / financialGoal) * 100, 100) 
    : 0;

  const getStatusStyle = () => {
    const statusStyles = {
      active: 'bg-[#b5e48c]/90 text-green-dark',
      pending: 'bg-[#ffd166]/90 text-[#856404]',
      draft: 'bg-[#e9ecef]/90 text-gray',
      completed: 'bg-[#8ecae6]/90 text-blue-dark',
      cancelled: 'bg-[#dc3545]/90 text-white',
    };
    return statusStyles[status] || 'bg-[#e9ecef]/90 text-gray';
  };

  const getDaysRemaining = () => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Link to={`${ROUTES.PROJECTS}/${projectId}`} className="block h-full no-underline group">
      <div className="bg-white border-none shadow-sm rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md h-full flex flex-col">
        
        <div className="h-[160px] bg-gradient-to-br from-yellow to-orange relative flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white">
            <FiTarget size={32} />
          </div>
          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle()}`}>
            {status}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2 transition-colors group-hover:text-orange">
            {title}
          </h3>
          <p className="text-gray text-sm mb-4 line-clamp-2 flex-1">
            {description || 'No description provided'}
          </p>

          {financialGoal > 0 && (
            <div className="mb-4">
              <div className="flex justify-between mb-1.5 text-[13px]">
                <span className="font-semibold text-black">
                  {formatCurrency(currentAmount)}
                </span>
                <span className="text-gray">
                  of {formatCurrency(financialGoal)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-light-gray overflow-hidden">
                <div 
                  className="h-full bg-green rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-light-gray mt-auto">
            {startDate && (
              <div className="flex items-center gap-1.5 text-gray text-[13px]">
                <FiCalendar size={14} className="shrink-0" />
                <span>{formatDate(startDate)}</span>
              </div>
            )}
            {daysRemaining !== null && status === 'active' && (
              <div className="flex items-center gap-1.5 text-gray text-[13px]">
                <FiUsers size={14} className="shrink-0" />
                <span>{daysRemaining} days left</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </Link>
  );
}