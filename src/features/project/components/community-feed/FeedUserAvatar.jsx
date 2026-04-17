import { getProjectFeedAvatarFallback } from "./utils/projectFeed.utils";

export function FeedUserAvatar({ user, size = "md" }) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-sm" : "h-12 w-12 text-lg";

  return (
    <div
      className={`flex ${sizeClass} flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-700`}
    >
      {user?.avatar ? (
        <img alt="avatar" className="h-full w-full object-cover" src={user.avatar} />
      ) : (
        getProjectFeedAvatarFallback(user?.fullName)
      )}
    </div>
  );
}

export default FeedUserAvatar;