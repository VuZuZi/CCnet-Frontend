// src/features/project/components/volunteer/ApplicationFooter.jsx
import { Send } from 'lucide-react';

export function ApplicationFooter({ onCancel, onSubmit, isSubmitting = false }) {
    return (
        <footer className="border-t border-slate-100 dark:border-slate-800 mt-10 pt-8 flex justify-end items-center gap-4">
            <button
                type="button"
                onClick={onCancel}
                className="text-slate-500 dark:text-slate-400 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                Cancel
            </button>

            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:brightness-105 active:scale-95 text-slate-900 font-bold px-8 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                <Send size={16} />
            </button>
        </footer>
    );
}