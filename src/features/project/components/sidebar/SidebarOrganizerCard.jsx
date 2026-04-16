import { UserPlus, UserCheck } from "lucide-react";

export function SidebarOrganizerCard({
  organizer,
  organizerId,
  currentUserId,
  isFollowingOrg,
  follow,
  unfollow,
  onToggleFollowOrg,
}) {
  if (!organizer) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={organizer?.avatar || "https://ui-avatars.com/api/?name=Org"}
          alt="Organizer"
          className="h-10 w-10 rounded-full border border-gray-200 object-cover"
        />

        <div className="min-w-0">
          <span className="block truncate text-sm font-bold text-slate-900">
            {organizer?.fullName || "Tổ chức / Cá nhân"}
          </span>
          <span className="text-xs font-medium text-slate-500">Chủ dự án</span>
        </div>
      </div>

      {currentUserId && currentUserId !== organizerId ? (
        <button
          type="button"
          onClick={onToggleFollowOrg}
          disabled={follow.isPending || unfollow.isPending}
          className={`ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
            isFollowingOrg
              ? "border-slate-200 bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
          } ${
            follow.isPending || unfollow.isPending
              ? "cursor-not-allowed opacity-70"
              : ""
          }`}
        >
          {isFollowingOrg ? (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              Đã theo dõi
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Theo dõi
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}

export default SidebarOrganizerCard;