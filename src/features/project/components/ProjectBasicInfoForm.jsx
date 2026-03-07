export function ProjectBasicInfoForm({ values, errors, touched, handleChange, handleBlur }) {
  const titleMaxLength = 200;
  const descriptionMaxLength = 5000;

  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <p className="text-[#dc3545] text-sm mt-1 mb-0">{errors[field]}</p>
    ) : null;

  const getCharCountClass = (current, max) => {
    const ratio = current / max;
    if (ratio >= 1) return 'text-[#dc3545]';
    if (ratio >= 0.9) return 'text-orange';
    return 'text-gray';
  };

  return (
    <div className="p-6 border-b border-light-gray">
      <h3 className="text-lg font-semibold text-black mb-1">Basic Information</h3>
      <p className="text-gray text-sm mb-5">
        Give your campaign a clear title and description to attract supporters
      </p>

      <div className="mb-5">
        <label className="block text-sm font-medium text-dark mb-2">
          Campaign Title <span className="text-[#dc3545] ml-1">*</span>
        </label>
        <input
          type="text"
          className={`block w-full rounded-md border py-2.5 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors ${touched.title && !!errors.title ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
            }`}
          placeholder="Enter a compelling title for your campaign"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          maxLength={titleMaxLength}
        />
        {renderError('title')}
        <div className={`text-xs text-right mt-1 ${getCharCountClass(values.title?.length || 0, titleMaxLength)}`}>
          {values.title?.length || 0}/{titleMaxLength}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-2">Description</label>
        <textarea
          className={`block w-full rounded-md border py-2.5 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors min-h-[120px] resize-y ${touched.description && !!errors.description ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
            }`}
          placeholder="Describe your campaign, its goals, and how the funds will be used..."
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          maxLength={descriptionMaxLength}
          rows={6}
        />
        {renderError('description')}
        <div className={`text-xs text-right mt-1 ${getCharCountClass(values.description?.length || 0, descriptionMaxLength)}`}>
          {values.description?.length || 0}/{descriptionMaxLength}
        </div>
        <p className="text-[13px] text-gray mt-1.5 mb-0">
          A detailed description helps potential donors understand your cause
        </p>
      </div>
    </div>
  );
}