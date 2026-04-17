import { useMemo, useState } from "react";
import {
  filterAdminProjects,
  getAdminProjectStats,
} from "../utils/projectFilter.utils";

export const useAdminProjectsManager = (projects) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");

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
    filteredProjects,
    stats,
  };
};

export default useAdminProjectsManager;