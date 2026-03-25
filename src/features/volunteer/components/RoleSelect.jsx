// src/features/project/components/volunteer/RoleSelect.jsx
import { ChevronDown } from 'lucide-react';

const ROLES = [
    { value: 'field-planting', label: 'Field Planting Assistant' },
    { value: 'logistics', label: 'Logistics Coordinator' },
    { value: 'education', label: 'Environmental Educator' },
    { value: 'data', label: 'Data Collection Specialist' }
];

export function RoleSelect({ value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Select Role
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white cursor-pointer"
                    required
                >
                    <option value="" disabled>Choose a position</option>
                    {ROLES.map(role => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronDown size={20} />
                </div>
            </div>
        </div>
    );
}