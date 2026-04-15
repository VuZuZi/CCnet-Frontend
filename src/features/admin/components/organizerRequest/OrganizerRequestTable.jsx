import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import OrganizerRequestStatusBadge from "./OrganizerRequestStatusBadge";

const formatDate = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
};

export function OrganizerRequestTable({ items = [], isLoading = false }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[20px] font-black text-slate-900">
              Organizer Applications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review submitted organizer upgrade applications.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500">
            Showing {items.length} request(s)
          </div>
        </div>
      </div>

      <div className="min-h-[460px] overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-slate-50/90">
            <tr className="text-left text-slate-500">
              <th className="w-[30%] px-6 py-4 font-bold">Applicant</th>
              <th className="w-[24%] px-6 py-4 font-bold">Organization</th>
              <th className="w-[16%] px-6 py-4 font-bold">Status</th>
              <th className="w-[15%] px-6 py-4 font-bold">Submitted</th>
              <th className="w-[15%] px-6 py-4 text-right font-bold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-r-transparent" />
                  <p className="mt-4 text-sm text-slate-500">
                    Loading organizer requests...
                  </p>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-24 text-center">
                  <p className="text-base font-bold text-slate-700">
                    No organizer requests found
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    No matching requests for the current filters.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="transition hover:bg-amber-50/20">
                  <td className="px-6 py-5 align-top">
                    <div className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-all duration-200 hover:border-amber-300 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_12px_28px_rgba(245,158,11,0.10)]">
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                          {item.fullNameSnapshot}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
                          <Mail size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate">{item.emailSnapshot}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 align-top">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                      {item.organizationName || "--"}
                    </div>
                  </td>

                  <td className="px-6 py-5 align-top">
                    <OrganizerRequestStatusBadge status={item.status} />
                  </td>

                  <td className="px-6 py-5 align-top">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      {formatDate(item.submittedAt || item.createdAt)}
                    </div>
                  </td>

                  <td className="px-6 py-5 align-top text-right">
                    <Link
                      to={`/admin/organizers/${item._id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
                    >
                      Review
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrganizerRequestTable;