import { Link } from 'react-router-dom';
import OrganizerRequestStatusBadge from './OrganizerRequestStatusBadge';

const formatDate = (value) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));
};

export function OrganizerRequestTable({ items = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-r-transparent" />
        <p className="mt-4 text-sm text-slate-500">Đang tải danh sách hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-500">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Organization</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Submitted</th>
              <th className="px-6 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                  Chưa có hồ sơ Organizer nào.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100 hover:bg-amber-50/30">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{item.fullNameSnapshot}</div>
                    <div className="text-xs text-slate-500">{item.emailSnapshot}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{item.organizationName}</td>
                  <td className="px-6 py-4">
                    <OrganizerRequestStatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(item.submittedAt || item.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/organizers/${item._id}`}
                      className="inline-flex rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-300"
                    >
                      Review
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