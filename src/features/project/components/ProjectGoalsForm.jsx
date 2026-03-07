import { FiDollarSign } from 'react-icons/fi';

export function ProjectGoalsForm({ values, errors, touched, handleChange, handleBlur }) {
  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <p className="text-[#dc3545] text-sm mt-1 mb-0">{errors[field]}</p>
    ) : null;

  const handleFinancialGoalChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      handleChange('financialGoal', value);
    }
  };

  return (
    <div className="p-6 border-b border-light-gray">
      <h3 className="text-lg font-semibold text-black mb-1">Campaign Goals</h3>
      <p className="text-gray text-sm mb-5">
        Set your fundraising target to let donors know what you're aiming for
      </p>

      <div>
        <label className="block text-sm font-medium text-dark mb-2">Financial Goal</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray">
            <FiDollarSign size={18} />
          </div>
          <input
            type="text"
            inputMode="decimal"
            className={`block w-full rounded-md border py-2.5 pl-10 pr-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
              touched.financialGoal && !!errors.financialGoal ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
            }`}
            placeholder="0.00"
            value={values.financialGoal}
            onChange={handleFinancialGoalChange}
            onBlur={() => handleBlur('financialGoal')}
          />
        </div>
        {renderError('financialGoal')}
        <p className="text-[13px] text-gray mt-1.5 mb-0">
          Leave empty or enter 0 if you're not setting a financial goal
        </p>
      </div>
    </div>
  );
}