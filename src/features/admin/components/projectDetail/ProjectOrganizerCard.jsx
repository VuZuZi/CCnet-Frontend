import { BadgeCheck, ExternalLink } from "lucide-react";

export default function ProjectOrganizerCard({
  organizer,
  organizerProfilePath,
  canOpenOrganizerProfile,
}) {
  return (
    <div
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md"
      onClick={() => {
        if (canOpenOrganizerProfile) {
          window.open(organizerProfilePath, "_blank", "noopener,noreferrer");
        }
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-black text-slate-900">Organizer</h4>

        {canOpenOrganizerProfile ? (
          <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
            Open
            <ExternalLink size={12} />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {organizer?.avatar ? (
            <img
              src={organizer.avatar}
              alt="Organizer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-600">
              {(organizer?.fullName || "O").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-black text-slate-900 md:text-base">
              {organizer?.fullName || "Anonymous Organizer"}
            </p>

            {organizer?.isVerified ? (
              <BadgeCheck size={16} className="shrink-0 text-blue-500" />
            ) : null}
          </div>

          <p className="mt-1 truncate text-sm text-slate-500">
            {organizer?.email || "--"}
          </p>

          {organizer?.phone ? (
            <p className="mt-1 truncate text-xs text-slate-400">
              {organizer.phone}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}