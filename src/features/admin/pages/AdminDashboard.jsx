import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../api/adminAPI";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Flag, 
  Bell, 
  LogOut, 
  ExternalLink 
} from "lucide-react";

const DUMMY_PROJECTS = [
  { _id: "1", title: "Charity Run 2024", organizer: "JohnDoe", status: "Active", progress: 75, date: "2024-03-10" },
  { _id: "2", title: "Beach Cleanup", organizer: "EcoTeam", status: "Completed", progress: 100, date: "2024-02-15" },
  { _id: "3", title: "Tech Workshop", organizer: "SarahDev", status: "Pending", progress: 30, date: "2024-04-01" },
  { _id: "4", title: "Food Drive", organizer: "CommunityHelp", status: "Cancelled", progress: 0, date: "2024-01-20" },
  { _id: "5", title: "Local Art Fair", organizer: "ArtCollective", status: "Active", progress: 50, date: "2024-05-12" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [notifyData, setNotifyData] = useState({ title: "", message: "", recipient: "" });

  const [showModal, setShowModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [selectedActions, setSelectedActions] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === "overview") {
        const res = await adminAPI.getStats();
        setStats(res?.data?.data);
      } else if (activeTab === "users") {
        const res = await adminAPI.getUsers();
        setUsers(res?.data?.data || []);
      } else if (activeTab === "reports") {
        const res = await adminAPI.getReports();
        setReports(res?.data?.data || []);
      }
    } catch (err) {
      console.error("Load failed", err);
    }
  };

  const handleBan = async (id, currentIsActive) => {
    const actionName = currentIsActive ? "Ban" : "Unban";
    if (window.confirm(`Are you sure you want to ${actionName.toLowerCase()} this user?`)) {
      try {
        await adminAPI.toggleBan(id);
        loadData();
      } catch (err) {
        console.error(`${actionName} failed:`, err);
        alert(`Failed to ${actionName} user. Check console for details.`);
      }
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    await adminAPI.createNotification(notifyData);
    alert("Sent!");
    setNotifyData({ title: "", message: "", recipient: "" });
  };

  const openResolutionModal = (reportId) => {
    setSelectedReportId(reportId);
    setSelectedActions([]);
    setResolutionNote("");
    setShowModal(true);
  };

  const handleCheckboxChange = (actionValue) => {
    setSelectedActions((prev) => 
      prev.includes(actionValue) 
        ? prev.filter((a) => a !== actionValue) 
        : [...prev, actionValue]
    );
  };

  const submitResolution = async () => {
    if (!selectedReportId) return;
    try {
      const actionsToSend = selectedActions.length > 0 ? selectedActions : ["mark_resolved"];
      await adminAPI.resolveReport(selectedReportId, actionsToSend, resolutionNote || "No note provided");
      setShowModal(false);
      loadData();
    } catch (err) {
      alert("Failed to resolve report");
    }
  };

  const filteredUsers = users.filter((u) => userFilter === "all" ? true : u.role === userFilter);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white shadow-sm shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            CCNET<span className="text-amber-400">.Admin</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-1 pr-4" aria-label="Sidebar">
          <SidebarItem id="overview" label="Dashboard" icon={LayoutDashboard} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="users" label="Users & Roles" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="projects" label="Projects" icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="reports" label="Reports" icon={Flag} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="notify" label="Notifications" icon={Bell} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
        <div className="p-6 border-t border-gray-100">
          <Link 
            to="/dashboard" 
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 capitalize tracking-tight">{activeTab}</h2>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Users" value={stats.users?.total || 0} subtext="Registered" />
              <StatCard title="Active Projects" value={DUMMY_PROJECTS.length} subtext="Organizer Events" />
              <StatCard title="Total Posts" value={stats.posts?.total || 0} subtext="Platform Content" />
              <StatCard 
                title="Reports" 
                value={stats.reports?.find((r) => r._id === "pending")?.count || 0} 
                subtext="Action Needed" 
                highlight 
              />
            </div>

            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm max-w-4xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Growth</h3>
              <div className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100 text-xs font-medium text-white">
                <div className="flex flex-col justify-center whitespace-nowrap bg-emerald-500 text-center px-2" style={{ width: "70%" }}>Healthy</div>
                <div className="flex flex-col justify-center whitespace-nowrap bg-amber-400 text-black text-center px-2" style={{ width: "20%" }}>Reports</div>
                <div className="flex flex-col justify-center whitespace-nowrap bg-red-500 text-center px-2" style={{ width: "10%" }}>Bans</div>
              </div>
            </section>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">User Management</h3>
              <select
                className="rounded-lg border-gray-300 bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="organizer">Organizers</option>
                <option value="user">Users</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-semibold text-gray-900">{u.username || u.fullName}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800 border border-gray-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive ? "Active" : "Banned"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => handleBan(u._id, u.isActive)}
                          className="rounded bg-amber-400 px-3 py-1.5 text-sm font-bold text-black hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                        >
                          {u.isActive ? "Ban" : "Unban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">Projects & Events</h3>
              <button
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                onClick={() => alert("Demo Feature")}
              >
                + New Project
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {DUMMY_PROJECTS.map((proj) => (
                    <tr key={proj._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900">{proj.title}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{proj.organizer}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                          ${proj.status === "Active" ? "bg-emerald-100 text-emerald-800" : 
                            proj.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 w-1/4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full bg-gray-900" style={{ width: `${proj.progress}%` }}></div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-gray-500 italic">No reports found.</p>
            ) : (
              reports.map((report) => (
                <div key={report._id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="inline-flex rounded bg-gray-900 px-2 py-1 text-xs font-bold text-white uppercase">{report.target_type}</span>
                        <span className={`inline-flex rounded px-2 py-1 text-xs font-bold uppercase
                          ${report.status === "resolved" ? "bg-emerald-100 text-emerald-800" : 
                            report.status === "rejected" ? "bg-gray-100 text-gray-800" : "bg-amber-100 text-amber-800"}`}
                        >
                          {report.status}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-gray-900">{report.reason_code}</h4>
                      <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                      
                      <div className="mt-4 max-w-2xl rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                          <span>Target ID: {report.target_ref?._id || "Unknown/Deleted"}</span>
                          {report.target_ref?._id && (
                            <Link to={`/community/${report.target_ref._id}`} target="_blank" className="flex items-center font-bold text-gray-900 hover:underline">
                              View Post <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          )}
                        </div>
                        {report.target_ref?.content && (
                          <blockquote className="border-l-4 border-amber-400 pl-3 italic text-gray-800">
                            "{report.target_ref.content}"
                          </blockquote>
                        )}
                        {report.target_ref?.author && (
                          <div className="mt-3 font-mono text-xs text-gray-500">
                            Author ID: {report.target_ref.author}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex min-w-[160px] flex-col items-end gap-2 text-right">
                      {report.status === "pending" ? (
                        <button
                          onClick={() => openResolutionModal(report._id)}
                          className="w-full rounded bg-amber-400 px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition-colors"
                        >
                          Resolve / Dismiss
                        </button>
                      ) : (
                        <div className="rounded-lg bg-gray-50 p-3 w-full text-left border border-gray-100">
                          <span className="block text-xs font-bold text-gray-500">Action Taken:</span>
                          <span className="mb-2 block text-sm text-gray-900">{report.action || "None"}</span>
                          
                          <span className="block text-xs font-bold text-gray-500">Note:</span>
                          <span className="block text-sm text-gray-600 truncate max-w-[200px]" title={report.decision_note}>
                            {report.decision_note || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NOTIFY TAB */}
        {activeTab === "notify" && (
          <div className="max-w-xl rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Send System Notification</h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label htmlFor="notify-title" className="mb-1 block text-sm font-bold text-gray-700">Title</label>
                <input
                  id="notify-title"
                  type="text"
                  required
                  className="w-full rounded-lg border-0 bg-gray-50 px-4 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-400"
                  value={notifyData.title}
                  onChange={(e) => setNotifyData({ ...notifyData, title: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="notify-msg" className="mb-1 block text-sm font-bold text-gray-700">Message</label>
                <textarea
                  id="notify-msg"
                  rows="4"
                  required
                  className="w-full rounded-lg border-0 bg-gray-50 px-4 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-400"
                  value={notifyData.message}
                  onChange={(e) => setNotifyData({ ...notifyData, message: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full rounded-lg bg-amber-400 py-3 font-bold text-black hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                Send Notification
              </button>
            </form>
          </div>
        )}
      </main>

      {/* RESOLUTION MODAL */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-2 text-xl font-bold text-gray-900">Resolve Report</h4>
            <p className="mb-6 text-sm text-gray-500">Select actions to take (multiple selection allowed):</p>

            <div className="mb-6 space-y-3">
              <label className="flex cursor-pointer items-start rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    checked={selectedActions.includes("delete_content")}
                    onChange={() => handleCheckboxChange("delete_content")}
                  />
                </div>
                <div className="ml-3 flex-1 text-sm">
                  <span className="font-bold text-red-600 block">Delete Content</span>
                  <span className="text-gray-500 block mt-1">Removes post permanently.</span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    checked={selectedActions.includes("ban_user")}
                    onChange={() => handleCheckboxChange("ban_user")}
                  />
                </div>
                <div className="ml-3 flex-1 text-sm">
                  <span className="font-bold text-gray-900 block">Ban User</span>
                  <span className="text-gray-500 block mt-1">Suspends author's account.</span>
                </div>
              </label>
            </div>

            <div className="mb-6">
              <label htmlFor="resolution-note" className="mb-2 block text-sm font-bold text-gray-900">Decision Note</label>
              <textarea
                id="resolution-note"
                rows="3"
                placeholder="Reason for decision..."
                className="w-full rounded-lg border-0 bg-gray-50 px-4 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-400"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitResolution}
                className="flex-1 rounded-lg bg-amber-400 px-4 py-2.5 font-bold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Extracted Sub-components for better readability
 */
function SidebarItem({ id, label, icon: Icon, activeTab, setActiveTab }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`group flex w-full items-center rounded-r-full px-6 py-3 text-sm font-medium transition-colors ${
        isActive 
          ? "bg-amber-400 text-black font-bold" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"}`} aria-hidden="true" />
      {label}
    </button>
  );
}

function StatCard({ title, value, subtext, highlight = false }) {
  return (
    <article className={`flex flex-col justify-center rounded-xl border border-gray-100 p-6 shadow-sm transition-shadow hover:shadow-md ${highlight ? 'bg-amber-50' : 'bg-white'}`}>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      <p className="mb-1 text-4xl font-black tracking-tight text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </article>
  );
}