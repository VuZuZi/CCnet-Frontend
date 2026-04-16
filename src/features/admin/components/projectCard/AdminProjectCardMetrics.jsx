import { Users, Wallet } from "lucide-react";
import {
  formatVnd,
} from "../../utils/adminProjectDisplay.utils";
import { getProgressWidth } from "../../utils/adminProjectCard.utils";

export default function AdminProjectCardMetrics({
  tone,
  currentAmount,
  targetAmount,
  isFundraising,
  fundsPercent,
  rolesCount,
  currentVolunteers,
  targetVolunteers,
  hasVolunteerTarget,
  volunteerPercent,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        className={`rounded-xl border border-slate-200 p-3 shadow-sm ${tone.section}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Wallet size={15} />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Funding
            </span>
          </div>

          <span className="text-xs font-semibold text-amber-700">
            {isFundraising ? `${fundsPercent}%` : "Volunteer only"}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-700"
            style={{ width: getProgressWidth(fundsPercent) }}
          />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">
            {formatVnd(currentAmount)} VND
          </p>
          <p className="text-xs text-slate-500">
            Target: {formatVnd(targetAmount)} VND
          </p>
        </div>
      </div>

      <div
        className={`rounded-xl border border-slate-200 p-3 shadow-sm ${tone.section}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Users size={15} />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Volunteers
            </span>
          </div>

          <span className="text-xs font-semibold text-emerald-700">
            {hasVolunteerTarget ? `${volunteerPercent}%` : "N/A"}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-700"
            style={{ width: getProgressWidth(volunteerPercent) }}
          />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">
            {currentVolunteers.toLocaleString()} volunteers
          </p>
          <p className="text-xs text-slate-500">
            Target: {targetVolunteers.toLocaleString()}
          </p>
        </div>

        {rolesCount > 0 ? (
          <div className="mt-2 text-xs text-slate-500">
            Roles: {rolesCount}
          </div>
        ) : null}
      </div>
    </div>
  );
}