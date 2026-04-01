// src/features/admin/components/UserManagement.jsx
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { ShieldBan, ShieldCheck, BadgeCheck, BadgeX, Briefcase, Heart } from "lucide-react";

const UserManagement = () => {
  const { users, loading, toggleBanUser, toggleVerifiedUser } =
      useAdminDashboard("users");

  const handleToggleBan = (user) => {
    const action = user.isActive ? "ban" : "unban";

    const confirmed = window.confirm(
        `Are you sure you want to ${action} this user?`,
    );

    if (!confirmed) return;

    toggleBanUser(user._id);
  };

  const handleToggleVerified = (user) => {
    const action = user.isVerified ? "remove verified badge from" : "verify";
    const confirmed = window.confirm(
        `Are you sure you want to ${action} this user?`,
    );
    if (!confirmed) return;
    toggleVerifiedUser(user._id, !user.isVerified);
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
              <th className="px-6 py-4">Projects Completed</th>
              <th className="px-6 py-4">Projects Participated</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
            </thead>

            <tbody>
            {loading && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
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

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 truncate">
                          {user.fullName}
                        </span>
                            {user.isVerified && (
                                <BadgeCheck
                                    size={16}
                                    className="text-blue-500 flex-shrink-0"
                                    title="Verified"
                                />
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {user.role}
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>

                      {/* PROJECTS COMPLETED */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
                        {Number(user.completedProjectsCount || 0)}
                      </span>
                        </div>
                      </td>

                      {/* ✅ PROJECTS PARTICIPATED (ORGANIZER + VOLUNTEER) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">
                        {Number(user.totalProjectsParticipated || 0)}
                      </span>
                      {/*    <span className="text-xs text-slate-400 ml-1">*/}
                      {/*  ({Number(user.totalProjectsAsOrganizer || 0)} org /{" "}*/}
                      {/*      {Number(user.joinedProjectsAsVolunteerCount || 0)} vol)*/}
                      {/*</span>*/}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        {user.isActive === false ? (
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                              onClick={() => handleToggleVerified(user)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold ${
                                  user.isVerified
                                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                      : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                              }`}
                          >
                            {user.isVerified ? (
                                <>
                                  <BadgeX size={16} />
                                  Unverify
                                </>
                            ) : (
                                <>
                                  <BadgeCheck size={16} />
                                  Verify
                                </>
                            )}
                          </button>

                          <button
                              onClick={() => handleToggleBan(user)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold ${
                                  user.isActive === false
                                      ? "bg-emerald-500 hover:bg-emerald-600"
                                      : "bg-red-500 hover:bg-red-600"
                              }`}
                          >
                            {user.isActive === false ? (
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