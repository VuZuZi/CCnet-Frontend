export function ProjectDateForm({ values, errors, touched, handleChange, handleBlur }) {
  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <p className="text-[#dc3545] text-sm mt-1 mb-0">{errors[field]}</p>
    ) : null;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 border-b border-light-gray">
      <h3 className="text-lg font-semibold text-black mb-1">Campaign Timeline</h3>
      <p className="text-gray text-sm mb-5">
        Set the duration of your campaign to create urgency and transparency
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Start Date</label>
          <input
            type="date"
            className={`block w-full rounded-md border py-2.5 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
              touched.startDate && !!errors.startDate ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
            }`}
            value={values.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            onBlur={() => handleBlur('startDate')}
            min={today}
          />
          {renderError('startDate')}
          <p className="text-[13px] text-gray mt-1.5 mb-0">When will your campaign begin?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-2">End Date</label>
          <input
            type="date"
            className={`block w-full rounded-md border py-2.5 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${
              touched.endDate && !!errors.endDate ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
            }`}
            value={values.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            onBlur={() => handleBlur('endDate')}
            min={values.startDate || today}
          />
          {renderError('endDate')}
          <p className="text-[13px] text-gray mt-1.5 mb-0">When should the campaign end?</p>
        </div>
      </div>
    </div>
  );
}