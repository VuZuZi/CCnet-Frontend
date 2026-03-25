// src/features/project/components/volunteer/ApplicantProfile.jsx
import { Verified } from 'lucide-react';

export function ApplicantProfile({ user }) {
    const trustScore = user?.trustScore || 850;
    const avatarUrl = user?.avatar || 'https://via.placeholder.com/48';

    return (
        <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Applicant Profile
            </h2>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        <img
                            src={avatarUrl}
                            alt={user?.fullName || 'User Avatar'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-bold">
                            {user?.fullName || 'User Name'}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                            {user?.email || 'user@example.com'}
                        </span>
                    </div>
                </div>

                {/* Trust Score Badge */}
                <div className="bg-primary/20 text-yellow-800 dark:text-primary text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1">
                    <Verified size={12} />
                    Trust Score: {trustScore.toLocaleString()} pts
                </div>
            </div>
        </section>
    );
}