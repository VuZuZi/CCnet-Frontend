import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { ShieldBan, ShieldCheck } from "lucide-react";

const UserManagement = () => {
  const { users, loading, toggleBanUser } = useAdminDashboard("users");

  const handleToggleBan = (user) => {
    const action = user.isBanned ? "unban" : "ban";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`,
    );

    if (!confirmed) return;

    toggleBanUser(user._id);
  };

  return (
    <div className="space-y-6">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold text-slate-800">User Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr className="text-left text-slate-600 font-semibold">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="text-center py-10 text-slate-400">
                  Loading users...
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  {/* USER */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold">
                        {user.fullName?.slice(0, 2).toUpperCase() || "US"}
                      </div>
                    )}

                    <span className="font-semibold text-slate-800">
                      {user.fullName}
                    </span>
                  </td>

                  {/* EMAIL */}
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                        Banned
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-600">
                        Active
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleBan(user)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold ml-auto ${
                        user.isBanned
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {user.isBanned ? (
                        <>
                          <ShieldCheck size={16} />
                          Unban
                        </>
                      ) : (
                        <>
                          <ShieldBan size={16} />
                          Ban
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
