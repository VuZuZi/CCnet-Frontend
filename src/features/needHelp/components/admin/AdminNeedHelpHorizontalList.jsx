import { Link } from "react-router-dom";
import {
  CalendarDays,
  CircleDollarSign,
  MapPin,
  UserRound,
} from "lucide-react";

import { formatCurrency, formatDate } from "@/shared/lib/formatters";

const URGENCY_STYLES = {
  CRITICAL: "bg-rose-100 text-rose-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700",
};

const CATEGORY_LABELS = {
  Y_TE: "Medical Aid",
  GIAO_DUC: "Education",
  THIEN_TAI: "Disaster Relief",
  XAY_DUNG: "Construction",
  MOI_TRUONG: "Environment",
  KHAC: "Other",
};

export function AdminNeedHelpHorizontalList({ items = [] }) {
  const truncateText = (text, maxLength = 30) =>
    text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text || "";

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No need help requests matched the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const urgencyStyle =
          URGENCY_STYLES[item.urgencyLevel] || URGENCY_STYLES.MEDIUM;
        const categoryLabel = CATEGORY_LABELS[item.category] || "Other";
        const requesterName = item.requesterId?.fullName || "Anonymous";
        const coverImage = item.evidences?.[0]?.url;

        return (
          <Link
            key={item._id}
            to={`/admin/need-help/${item._id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 grid gap-4 sm:grid-cols-[1fr_auto] items-start">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 text-base font-bold text-slate-900">
                    {truncateText(item.title, 30)}
                  </h3>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${urgencyStyle}`}
                  >
                    {item.urgencyLevel}
                  </span>
                  <span className="flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {categoryLabel}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {truncateText(item.story, 30)}
                </p>
              </div>
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-bold uppercase text-slate-500">
                    {requesterName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0].toUpperCase())
                      .join("")}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <UserRound size={11} />
                  Requester
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                  {requesterName}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <MapPin size={11} />
                  Location
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-700">
                  {item.location?.address || "N/A"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <CircleDollarSign size={11} />
                  Funding
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                  {item.amountNeeded
                    ? formatCurrency(item.amountNeeded)
                    : "Flexible"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <CalendarDays size={11} />
                  Submitted
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-700">
                  {formatDate(item.createdAt) || "Recently"}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default AdminNeedHelpHorizontalList;
