import { format } from 'date-fns';
import { Star } from 'lucide-react';

export function AboutMeCard({ about, level, title, createdAt }) {
  const joinedDate = createdAt ? format(new Date(createdAt), 'MMMM yyyy') : 'Unknown';

  return (
    <article className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100" data-purpose="about-section">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">About Me</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {about || "This user hasn't written anything about themselves yet."}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Level {level || 1} {title || 'Member'}
          </span>
          <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
          <span>Joined {joinedDate}</span>
        </div>
      </div>
    </article>
  );
}