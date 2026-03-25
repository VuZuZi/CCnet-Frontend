// src/features/project/components/volunteer/MotivationTextarea.jsx

export function MotivationTextarea({ value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Why do you want to join this project?
            </label>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full p-4 h-32 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                placeholder="Tell us about your motivation and relevant skills..."
                required
            />
        </div>
    );
}