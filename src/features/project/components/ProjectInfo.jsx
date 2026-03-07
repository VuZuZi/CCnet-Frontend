import { FiCalendar, FiTarget, FiMapPin, FiClock } from 'react-icons/fi';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';

export function ProjectInfo({ project }) {
  const { description, financialGoal, startDate, endDate, createdAt } = project;

  return (
    <>
      {/* Description Card */}
      <div className="bg-white shadow-sm rounded-2xl mb-6 border border-light-gray p-6">
        <h3 className="text-lg font-semibold text-black mb-4">About this Campaign</h3>
        <p className="text-dark leading-relaxed whitespace-pre-wrap">
          {description || 'No description has been provided for this campaign yet.'}
        </p>
      </div>

      {/* Details Card */}
      <div className="bg-white shadow-sm rounded-2xl mb-6 border border-light-gray p-6">
        <h3 className="text-lg font-semibold text-black mb-6">Campaign Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center text-gray shrink-0">
              <FiTarget size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-gray mb-1">Financial Goal</div>
              <div className="font-medium text-black">
                {financialGoal > 0 ? formatCurrency(financialGoal) : 'Not set'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center text-gray shrink-0">
              <FiCalendar size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-gray mb-1">Start Date</div>
              <div className="font-medium text-black">
                {startDate ? formatDate(startDate) : 'Not set'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center text-gray shrink-0">
              <FiClock size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-gray mb-1">End Date</div>
              <div className="font-medium text-black">
                {endDate ? formatDate(endDate) : 'No deadline'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center text-gray shrink-0">
              <FiMapPin size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-gray mb-1">Created On</div>
              <div className="font-medium text-black">
                {createdAt ? formatDate(createdAt) : 'Unknown'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}