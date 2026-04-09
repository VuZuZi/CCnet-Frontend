export function OrganizerRequestFilters({ filters, setFilters }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_180px]">
      <input
        value={filters.search}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            search: e.target.value,
            page: 1,
          }))
        }
        placeholder="Search by name, email, or organization..."
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
      />

      <select
        value={filters.status}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            status: e.target.value,
            page: 1,
          }))
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
      >
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="DECLINED">Declined</option>
      </select>
    </div>
  );
}

export default OrganizerRequestFilters;