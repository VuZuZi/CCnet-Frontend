import { useState, useEffect } from "react";
import { adminAPI } from "../api/adminAPI";
import { Link } from "react-router-dom";

const theme = {
  bg: "#f8f9fa",
  sidebar: "#ffffff",
  yellowBtn: {
    backgroundColor: "#FFD700",
    color: "#000",
    border: "none",
    fontWeight: "bold",
  },
};

const DUMMY_PROJECTS = [
  {
    _id: "1",
    title: "Charity Run 2024",
    organizer: "JohnDoe",
    status: "Active",
    progress: 75,
    date: "2024-03-10",
  },
  {
    _id: "2",
    title: "Beach Cleanup",
    organizer: "EcoTeam",
    status: "Completed",
    progress: 100,
    date: "2024-02-15",
  },
  {
    _id: "3",
    title: "Tech Workshop",
    organizer: "SarahDev",
    status: "Pending",
    progress: 30,
    date: "2024-04-01",
  },
  {
    _id: "4",
    title: "Food Drive",
    organizer: "CommunityHelp",
    status: "Cancelled",
    progress: 0,
    date: "2024-01-20",
  },
  {
    _id: "5",
    title: "Local Art Fair",
    organizer: "ArtCollective",
    status: "Active",
    progress: 50,
    date: "2024-05-12",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [notifyData, setNotifyData] = useState({
    title: "",
    message: "",
    recipient: "",
  });

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
        setStats(res.data.data);
      } else if (activeTab === "users") {
        const res = await adminAPI.getUsers();
        setUsers(res.data.data);
      } else if (activeTab === "reports") {
        const res = await adminAPI.getReports();
        setReports(res.data.data);
      }
    } catch (err) {
      console.error("Load failed", err);
    }
  };

  const handleBan = async (id, status) => {
    const reason = prompt(status ? "Unban reason?" : "Ban reason?");
    if (reason) {
      await adminAPI.toggleBan(id, reason);
      loadData();
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
    if (selectedActions.includes(actionValue)) {
      setSelectedActions(selectedActions.filter((a) => a !== actionValue));
    } else {
      setSelectedActions([...selectedActions, actionValue]);
    }
  };

  const submitResolution = async () => {
    if (!selectedReportId) return;
    try {
      const actionsToSend =
        selectedActions.length > 0 ? selectedActions : ["mark_resolved"];

      await adminAPI.resolveReport(
        selectedReportId,
        actionsToSend,
        resolutionNote || "No note provided",
      );
      setShowModal(false);
      loadData();
    } catch (err) {
      alert("Failed to resolve report");
    }
  };

  const filteredUsers = users.filter((u) =>
    userFilter === "all" ? true : u.role === userFilter,
  );

  const SidebarItem = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className="btn w-100 text-start py-3 px-4 mb-1 d-flex align-items-center"
      style={{
        backgroundColor: activeTab === id ? "#FFD700" : "transparent",
        fontWeight: activeTab === id ? "bold" : "normal",
        borderRadius: "0 25px 25px 0",
      }}
    >
      <i className={`bi ${icon} me-3`}></i> {label}
    </button>
  );

  const StatCard = ({ title, value, subtext, color = "white" }) => (
    <div
      className="card border-0 shadow-sm h-100"
      style={{ backgroundColor: color }}
    >
      <div className="card-body p-4">
        <h6 className="text-uppercase text-muted small fw-bold mb-2">
          {title}
        </h6>
        <h2 className="display-6 fw-bold mb-0">{value}</h2>
        <small className="text-muted">{subtext}</small>
      </div>
    </div>
  );

  return (
    <div
      className="d-flex position-relative"
      style={{ minHeight: "100vh", backgroundColor: theme.bg }}
    >
      <div
        className="d-flex flex-column shadow-sm"
        style={{
          width: "260px",
          backgroundColor: theme.sidebar,
          minHeight: "100vh",
        }}
      >
        <div className="p-4 mb-3">
          <h4 className="fw-bold m-0">
            CCNET<span style={{ color: "#FFD700" }}>.Admin</span>
          </h4>
        </div>
        <nav className="flex-grow-1 pe-3">
          <SidebarItem id="overview" label="Dashboard" icon="bi-grid-fill" />
          <SidebarItem id="users" label="Users & Roles" icon="bi-people-fill" />
          <SidebarItem
            id="projects"
            label="Projects"
            icon="bi-briefcase-fill"
          />
          <SidebarItem id="reports" label="Reports" icon="bi-flag-fill" />
          <SidebarItem id="notify" label="Notifications" icon="bi-bell-fill" />
        </nav>
        <div className="p-4">
          <Link to="/dashboard" className="btn btn-outline-dark w-100">
            Exit Admin
          </Link>
        </div>
      </div>

      <div className="flex-grow-1 p-5 overflow-auto">
        <h2 className="fw-bold text-black mb-5 text-capitalize">{activeTab}</h2>

        {activeTab === "overview" && stats && (
          <div className="row g-4">
            <div className="col-md-3">
              <StatCard
                title="Users"
                value={stats.users?.total || 0}
                subtext="Registered"
              />
            </div>
            <div className="col-md-3">
              <StatCard
                title="Active Projects"
                value={DUMMY_PROJECTS.length}
                subtext="Organizer Events"
              />
            </div>
            <div className="col-md-3">
              <StatCard
                title="Total Posts"
                value={stats.posts?.total || 0}
                subtext="Platform Content"
              />
            </div>
            <div className="col-md-3">
              <StatCard
                title="Reports"
                value={
                  stats.reports?.find((r) => r._id === "pending")?.count || 0
                }
                subtext="Action Needed"
                color="#FFF9C4"
              />
            </div>

            <div className="col-md-8 mt-4">
              <div className="card border-0 shadow-sm p-4 h-100">
                <h5>Platform Growth</h5>
                <div className="progress mt-3" style={{ height: "25px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: "70%" }}
                  >
                    Healthy Interactions
                  </div>
                  <div
                    className="progress-bar bg-warning text-dark"
                    style={{ width: "20%" }}
                  >
                    Reports
                  </div>
                  <div
                    className="progress-bar bg-danger"
                    style={{ width: "10%" }}
                  >
                    Bans
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">User Management</h5>
              <select
                className="form-select w-auto border-0 bg-light"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="organizer">Organizers</option>
                <option value="user">Users</option>
              </select>
            </div>
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="ps-4">
                      <strong>{u.username}</strong>
                      <br />
                      <small className="text-muted">{u.email}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${u.isBanned ? "bg-danger" : "bg-success"}`}
                      >
                        {u.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        style={theme.yellowBtn}
                        onClick={() => handleBan(u._id, u.isBanned)}
                      >
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between">
              <h5 className="mb-0 fw-bold">Projects & Events</h5>
              <button
                className="btn btn-sm btn-dark"
                onClick={() => alert("Demo Feature")}
              >
                + New Project
              </button>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Project</th>
                    <th>Organizer</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {DUMMY_PROJECTS.map((proj) => (
                    <tr key={proj._id}>
                      <td className="ps-4 fw-bold">{proj.title}</td>
                      <td>{proj.organizer}</td>
                      <td>
                        <span
                          className={`badge ${proj.status === "Active" ? "bg-success" : proj.status === "Pending" ? "bg-warning text-dark" : "bg-primary"}`}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td style={{ width: "20%" }}>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-dark"
                            style={{ width: `${proj.progress}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-dark">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "reports" && (
          <div className="row">
            {reports.map((report) => (
              <div key={report._id} className="col-12 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <span className="badge bg-dark mb-2 me-2">
                          {report.target_type}
                        </span>
                        <span
                          className={`badge ${report.status === "resolved" ? "bg-success" : report.status === "rejected" ? "bg-secondary" : "bg-warning text-dark"}`}
                        >
                          {report.status.toUpperCase()}
                        </span>

                        <h6 className="fw-bold mt-2">{report.reason_code}</h6>
                        <p className="small text-muted mb-1">
                          {report.description}
                        </p>
                        <div
                          className="p-3 bg-light rounded mt-2 border"
                          style={{ maxWidth: "600px" }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                              Target ID:{" "}
                              {report.target_ref?._id || "Unknown/Deleted"}
                            </small>

                            {report.target_ref?._id && (
                              <Link
                                to={`/community/${report.target_ref._id}`}
                                target="_blank"
                                className="small fw-bold text-decoration-none"
                                style={{ color: "#000" }}
                              >
                                View Post{" "}
                                <i className="bi bi-box-arrow-up-right ms-1"></i>
                              </Link>
                            )}
                          </div>

                          {report.target_ref?.content && (
                            <div className="fst-italic text-dark border-start border-4 ps-2 border-warning">
                              "{report.target_ref.content}"
                            </div>
                          )}

                          {report.target_ref?.author && (
                            <div className="small text-muted mt-2">
                              Author ID:{" "}
                              <span className="font-monospace">
                                {report.target_ref.author}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="d-flex flex-column gap-2 text-end ms-3"
                        style={{ minWidth: "160px" }}
                      >
                        {report.status === "pending" ? (
                          <button
                            className="btn btn-sm px-3 py-2"
                            style={theme.yellowBtn}
                            onClick={() => openResolutionModal(report._id)}
                          >
                            Resolve / Dismiss
                          </button>
                        ) : (
                          <div>
                            <small className="d-block text-muted fw-bold">
                              Action Taken:
                            </small>
                            <small className="d-block mb-2">
                              {report.action || "None"}
                            </small>

                            <small className="d-block text-muted fw-bold">
                              Note:
                            </small>
                            <small
                              className="d-block text-muted text-truncate"
                              style={{ maxWidth: "150px" }}
                              title={report.decision_note}
                            >
                              {report.decision_note}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-muted">No reports found.</p>
            )}
          </div>
        )}

        {activeTab === "notify" && (
          <div
            className="card border-0 shadow-sm"
            style={{ maxWidth: "600px" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Send System Notification</h5>
              <form onSubmit={handleSendNotification}>
                <div className="mb-3">
                  <label className="fw-bold">Title</label>
                  <input
                    className="form-control bg-light border-0"
                    value={notifyData.title}
                    onChange={(e) =>
                      setNotifyData({ ...notifyData, title: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Message</label>
                  <textarea
                    className="form-control bg-light border-0"
                    rows="4"
                    value={notifyData.message}
                    onChange={(e) =>
                      setNotifyData({ ...notifyData, message: e.target.value })
                    }
                  />
                </div>
                <button className="btn w-100 py-2" style={theme.yellowBtn}>
                  Send Notification
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div
            className="bg-white rounded p-4 shadow-lg"
            style={{ width: "450px" }}
          >
            <h5 className="fw-bold mb-3">Resolve Report</h5>
            <p className="text-muted small mb-3">
              Select actions to take (you can select both):
            </p>

            <div className="mb-3">
              <div className="form-check p-2 border rounded mb-2">
                <input
                  className="form-check-input ms-1"
                  type="checkbox"
                  id="checkDelete"
                  checked={selectedActions.includes("delete_content")}
                  onChange={() => handleCheckboxChange("delete_content")}
                />
                <label
                  className="form-check-label ms-2 fw-bold text-danger"
                  htmlFor="checkDelete"
                >
                  Delete Content
                </label>
                <div className="small text-muted ms-2 ps-4">
                  Removes post permanently.
                </div>
              </div>

              <div className="form-check p-2 border rounded mb-2">
                <input
                  className="form-check-input ms-1"
                  type="checkbox"
                  id="checkBan"
                  checked={selectedActions.includes("ban_user")}
                  onChange={() => handleCheckboxChange("ban_user")}
                />
                <label
                  className="form-check-label ms-2 fw-bold text-dark"
                  htmlFor="checkBan"
                >
                  Ban User
                </label>
                <div className="small text-muted ms-2 ps-4">
                  Suspends author's account.
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Decision Note</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Reason for decision..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              ></textarea>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn flex-grow-1"
                style={theme.yellowBtn}
                onClick={submitResolution}
              >
                Confirm
              </button>
              <button
                className="btn btn-light border"
                onClick={() => setShowModal(false)}
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
