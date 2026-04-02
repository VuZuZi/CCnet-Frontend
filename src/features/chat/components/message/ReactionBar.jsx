import {
  groupReactions,
  hasMyReaction,
} from '../../utils/message';

export default function ReactionBar({
  reactions = [],
  currentUserId,
  onReact,
}) {
  const grouped = groupReactions(reactions);

  if (!grouped.length) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {grouped.map((item) => {
        const active = hasMyReaction(reactions, item.emoji, currentUserId);

        return (
          <button
            key={item.emoji}
            type="button"
            onClick={() => onReact?.(item.emoji)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition ${
              active
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{item.emoji}</span>
            <span>{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}