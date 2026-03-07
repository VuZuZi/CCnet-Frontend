import { FiCalendar, FiTarget, FiUsers, FiClock } from 'react-icons/fi';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';

export function ProjectHeader({ project }) {
  const { title, status, financialGoal, currentAmount, startDate, endDate } = project;

  const progressPercent = financialGoal > 0 ? Math.min((currentAmount / financialGoal) * 100, 100) : 0;

  const getStatusStyle = () => {
    const statusStyles = {
      active: 'bg-[#b5e48c]/20 text-green-dark',
      pending: 'bg-[#ffd166]/20 text-orange',
      draft: 'bg-light-gray text-gray',
      completed: 'bg-[#8ecae6]/20 text-blue-dark',
      cancelled: 'bg-[#dc3545]/10 text-[#dc3545]',
    };
    return statusStyles[status] || 'bg-light-gray text-gray';
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
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden mb-6 border border-light-gray">
      <div className="h-[200px] bg-gradient-to-br from-yellow to-orange relative" />
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-black mb-2">{title}</h1>
            <div className="flex items-center gap-2 text-gray text-sm">
              <FiUsers size={16} />
              <span>Campaign</span>
            </div>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[13px] font-medium capitalize ${getStatusStyle()}`}>
            {status}
          </span>
        </div>
      </div>

      {financialGoal > 0 && (
        <div className="px-6 py-4 bg-white">
          <div className="flex justify-between mb-2">
            <span className="font-medium text-dark">
              {formatCurrency(currentAmount)} raised
            </span>
            <span className="text-green-dark font-semibold">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-light-gray overflow-hidden">
            <div 
              className="h-full bg-green rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border-t border-light-gray bg-[#fafafa]">
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <FiTarget size={20} className="text-gray mb-2 hidden sm:block" />
          <div className="text-2xl font-bold text-black">{formatCurrency(financialGoal)}</div>
          <div className="text-[13px] text-gray mt-1">Goal</div>
        </div>
        
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <FiCalendar size={20} className="text-gray mb-2 hidden sm:block" />
          <div className="text-2xl font-bold text-black">
            {startDate ? formatDate(startDate) : 'Not set'}
          </div>
          <div className="text-[13px] text-gray mt-1">Start Date</div>
        </div>

        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <FiClock size={20} className="text-gray mb-2 hidden sm:block" />
          <div className="text-2xl font-bold text-black">
            {daysRemaining !== null ? `${daysRemaining} days` : 'No deadline'}
          </div>
          <div className="text-[13px] text-gray mt-1">Remaining</div>
        </div>
      </div>
    </div>
  );
}