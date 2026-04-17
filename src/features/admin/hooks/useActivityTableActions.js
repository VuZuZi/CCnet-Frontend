import { useMemo, useState } from "react";
import { normalizeProjectStatus } from "../utils/projectStatus.utils";
import { buildReportActionReason } from "../utils/activityTable.utils";

export default function useActivityTableActions({
  activities = [],
  onProjectStatusChange,
  onUserBanToggle,
}) {
  const [projectStatuses, setProjectStatuses] = useState({});
  const [userActionLoadingMap, setUserActionLoadingMap] = useState({});
  const [projectActionLoadingMap, setProjectActionLoadingMap] = useState({});

  const safeActivities = useMemo(
    () => (Array.isArray(activities) ? activities : []),
    [activities]
  );

  const handleProjectStatusSelect = (reportId, status) => {
    setProjectStatuses((prev) => ({
      ...prev,
      [reportId]: status,
    }));
  };

  const handleProjectStatusApply = async (report) => {
    const target = report?.target_ref;
    if (!target?._id || !onProjectStatusChange) return;

    const currentStatus = normalizeProjectStatus(target?.status);
    const nextStatus = normalizeProjectStatus(
      projectStatuses[report._id] || currentStatus
    );

    if (!nextStatus || nextStatus === currentStatus) return;

    try {
      setProjectActionLoadingMap((prev) => ({ ...prev, [report._id]: true }));
      await onProjectStatusChange(target._id, {
        status: nextStatus,
        reason: buildReportActionReason(report),
      });
    } finally {
      setProjectActionLoadingMap((prev) => ({ ...prev, [report._id]: false }));
    }
  };

  const handleUserBanToggle = async (report) => {
    const target = report?.target_ref;
    if (!target?._id || !onUserBanToggle) return;

    try {
      setUserActionLoadingMap((prev) => ({ ...prev, [report._id]: true }));
      await onUserBanToggle(target._id, buildReportActionReason(report));
    } finally {
      setUserActionLoadingMap((prev) => ({ ...prev, [report._id]: false }));
    }
  };

  return {
    safeActivities,
    projectStatuses,
    userActionLoadingMap,
    projectActionLoadingMap,
    handleProjectStatusSelect,
    handleProjectStatusApply,
    handleUserBanToggle,
  };
}