import { useMemo, useState } from "react";
import {
  filterAdminProjects,
  getAdminProjectStats,
  getAdminVisibleProjects,
} from "../utils/projectFilter.utils";

export const useAdminProjectsManager = (projects = []) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const visibleProjects = useMemo(
    () => getAdminVisibleProjects(projects),
    [projects]
  );

  const filteredProjects = useMemo(
    () => filterAdminProjects(projects, filterStatus, searchText),
    [projects, filterStatus, searchText]
  );

  const stats = useMemo(() => getAdminProjectStats(projects), [projects]);

  return {
    filterStatus,
    setFilterStatus,
    searchText,
    setSearchText,
    visibleProjects,
    filteredProjects,
    stats,
  };
};

export default useAdminProjectsManager;