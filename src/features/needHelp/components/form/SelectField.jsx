import { ChevronDown } from 'lucide-react';
import { FormField, getInputClass } from './FormField';

export function SelectField({
  label,
  options,
  error,
  required,
  placeholder = 'Select an option',
  value,
  onChange,
  className = '',
  ...props
}) {
  return (
    <FormField label={label} error={error} required={required} className={className}>
      <div className="relative">
        <select
          className={`${getInputClass(!!error)} appearance-none pr-10`}
          value={value}
          onChange={onChange}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <ChevronDown size={18} />
        </div>
      </div>
    </FormField>
  );
}
