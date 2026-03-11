import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../api/adminAPI";

export const useAdminDashboard = (activeTab) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const res = await adminAPI.getStats();
        setStats(res?.data?.data || res?.data || null);

        // Optional: Fetch reports even on overview to show the 'Recent Activity' count
        const reportRes = await adminAPI.getReports();
        setReports(reportRes?.data?.data || reportRes?.data || []);
      } else if (activeTab === "reports") {
        const res = await adminAPI.getReports();
        setReports(res?.data?.data || res?.data || []);
      }
      // ... rest of your logic
    } catch (err) {
      console.error("Data load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // ... rest of the hook
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveReport = async (reportId, actions, note) => {
    try {
      await adminAPI.resolveReport(reportId, actions, note);
      await loadData();
    } catch (err) {
      console.error("Resolution failed:", err);
    }
  };

  return {
    stats,
    users,
    reports,
    loading,
    handleResolveReport,
    refresh: loadData,
  };
};
