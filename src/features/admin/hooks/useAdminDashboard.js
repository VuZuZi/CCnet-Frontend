import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../api/adminAPI";

export const useAdminDashboard = (activeTab) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // DASHBOARD OVERVIEW
      if (activeTab === "overview") {
        const statsRes = await adminAPI.getStats();
        setStats(statsRes?.data?.data || statsRes?.data || null);

        const reportRes = await adminAPI.getReports();
        setReports(reportRes?.data?.data || reportRes?.data || []);
      }

      // USER MANAGEMENT
      else if (activeTab === "users") {
        const res = await adminAPI.getUsers();
        setUsers(res?.data?.data || []);
      }

      // PROJECT MANAGEMENT
      else if (activeTab === "projects") {
        const res = await adminAPI.getProjects();
        setProjects(res?.data?.data || []);
      }

      // REPORT MANAGEMENT
      else if (activeTab === "reports") {
        const res = await adminAPI.getReports();
        setReports(res?.data?.data || []);
      }
    } catch (err) {
      console.error("Admin data load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Auto reload when tab changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  //  Ban / Unban User (Instant UI Update)
  const toggleBanUser = async (userId) => {
    try {
      const res = await adminAPI.toggleBan(userId);

      const updatedUser = res?.data?.data;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, ...updatedUser }
            : user,
        ),
      );
    } catch (err) {
      console.error("User ban toggle failed:", err);
    }
  };

  const toggleVerifiedUser = async (userId, isVerified) => {
    try {
      const res = await adminAPI.toggleVerified(userId, isVerified);
      const updatedUser = res?.data?.data;
      if (!updatedUser) return;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, ...updatedUser } : user,
        ),
      );
    } catch (err) {
      console.error("User verified toggle failed:", err);
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      await adminAPI.deleteProject(projectId);

      // Remove project from UI instantly
      setProjects((prev) =>
        prev.filter((project) => project._id !== projectId),
      );
    } catch (err) {
      console.error("Project deletion failed:", err);
    }
  };

  const updateProjectStatus = async (projectId, status) => {
    try {
      const res = await adminAPI.updateProjectStatus(projectId, status);
      const updated = res?.data?.data;

      if (!updated) return;

      setProjects((prev) =>
        prev.map((project) =>
          project._id === projectId ? { ...project, status: updated.status } : project,
        ),
      );
    } catch (err) {
      console.error("Project status update failed:", err);
    }
  };

  //  Resolve report
  const handleResolveReport = async (reportId, actions, note) => {
    try {
      await adminAPI.resolveReport(reportId, actions, note);

      // Remove resolved report from UI
      setReports((prev) => prev.filter((report) => report._id !== reportId));
    } catch (err) {
      console.error("Report resolution failed:", err);
    }
  };

  return {
    stats,
    users,
    projects,
    reports,
    loading,

    toggleBanUser,
    toggleVerifiedUser,
    updateProjectStatus,
    deleteProject,
    handleResolveReport,

    refresh: loadData,
  };
};
