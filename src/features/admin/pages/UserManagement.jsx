import { useState } from "react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { ShieldBan, ShieldCheck } from "lucide-react";

const UserManagement = () => {
  const { users, loading, toggleBanUser, toggleVerifyUser, updateUserStatus } =
    useAdminDashboard("users");
  const [statusUpdates, setStatusUpdates] = useState({});

  const handleToggleBan = (user) => {
    const action = user.status === "banned" ? "unban" : "ban";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`,
    );

    if (!confirmed) return;

    toggleBanUser(user._id);
  };

  const handleToggleVerify = (user) => {
    toggleVerifyUser(user._id, !user.isVerified);
  };

  const handleUpdateStatus = (user) => {
    const nextStatus = statusUpdates[user._id];
    if (!nextStatus || nextStatus === user.status) return;
    updateUserStatus(user._id, nextStatus);
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

                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      {user.fullName}
                      {user.isVerified && (
                        <ShieldCheck
                          size={16}
                          className="text-blue-500"
                          title="Verified user"
                        />
                      )}
                    </span>
                  </td>

                  {/* EMAIL */}
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {user.status === "banned" ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                        Banned
                      </span>
                    ) : user.status === "inactive" ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-600">
                        Inactive
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-600">
                        Active
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-right space-y-2">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center justify-end gap-2">
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleVerify(user)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold ${user.isVerified
                            ? "bg-slate-500 hover:bg-slate-600"
                            : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                          <ShieldCheck size={16} />
                          {user.isVerified ? "Unverify" : "Verify"}
                        </button>

                        <button
                          onClick={() => handleToggleBan(user)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold ${user.status === "banned"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-red-500 hover:bg-red-600"
                            }`}
                        >
                          {user.status === "banned" ? (
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
                      </div>
                    </div>
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
