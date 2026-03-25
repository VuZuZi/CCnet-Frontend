// src/features/project/components/volunteer/AvailabilityButtons.jsx
import { CheckCircle } from 'lucide-react';

const AVAILABILITY_OPTIONS = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Weekends', label: 'Weekends' },
    { value: 'Flexible', label: 'Flexible' }
];

export function AvailabilityButtons({ value, onChange }) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Availability
            </label>

            <div className="flex flex-wrap gap-3">
                {AVAILABILITY_OPTIONS.map(option => {
                    const isSelected = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`
                rounded-full px-5 py-2 text-sm font-medium transition-all
                ${isSelected
                                    ? 'border-2 border-primary text-slate-900 dark:text-white bg-primary/10 font-bold flex items-center gap-2'
                                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary bg-white dark:bg-slate-800'
                                }
              `}
                        >
                            {isSelected && <CheckCircle size={12} />}
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}