import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { useProjectMapQuery } from "../../hooks/useProjectMapQueries";
import {
  VIETNAM_DEFAULT_ZOOM,
  buildMapViewportParams,
  formatVisibleSummaryText,
  normalizeProjectMapResponse,
} from "../../utils/projectMap.utils";
import ProjectMapToolbar from "./ProjectMapToolbar";
import ProjectMapSidebar from "./ProjectMapSidebar";
import ProjectMapCanvas from "./ProjectMapCanvas";

const DEFAULT_FILTERS = {
  category: "",
  organizerScope: "ALL",
  search: "",
};

export default function ProjectMapShell() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [viewport, setViewport] = useState(null);
  const viewportFrameRef = useRef(0);

  const [activeProjectId, setActiveProjectId] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [clusterToExpand, setClusterToExpand] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locateRequestId, setLocateRequestId] = useState(0);
  const [resetRequestId, setResetRequestId] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput.trim(),
      }));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () =>
      buildMapViewportParams(
        viewport
          ? {
              north: viewport.north,
              south: viewport.south,
              east: viewport.east,
              west: viewport.west,
            }
          : null,
        viewport?.zoom ?? VIETNAM_DEFAULT_ZOOM,
        filters
      ),
    [viewport, filters]
  );

  const { data, isLoading, isFetching } = useProjectMapQuery(queryParams || {}, {
    enabled: Boolean(queryParams),
  });

  const normalized = useMemo(
    () => normalizeProjectMapResponse(data || {}),
    [data]
  );

  const handleViewportChange = useCallback((nextViewport) => {
    cancelAnimationFrame(viewportFrameRef.current);

    viewportFrameRef.current = requestAnimationFrame(() => {
      setViewport((prevViewport) => {
        const prevSignature = JSON.stringify(prevViewport || {});
        const nextSignature = JSON.stringify(nextViewport || {});
        if (prevSignature === nextSignature) {
          return prevViewport;
        }
        return nextViewport;
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(viewportFrameRef.current);
    };
  }, []);

  const resetSelection = useCallback(() => {
    setActiveProjectId("");
    setSelectedProject(null);
    setClusterToExpand(null);
  }, []);

  const handleCategoryChange = useCallback(
    (event) => {
      resetSelection();

      setFilters((prev) => ({
        ...prev,
        category: event.target.value,
      }));
    },
    [resetSelection]
  );

  const handleOrganizerScopeChange = useCallback(
    (event) => {
      resetSelection();

      setFilters((prev) => ({
        ...prev,
        organizerScope: event.target.value,
      }));
    },
    [resetSelection]
  );

  const handleSearchChange = useCallback(
    (event) => {
      resetSelection();
      setSearchInput(event.target.value);
    },
    [resetSelection]
  );

  const handleProjectSelect = useCallback((project) => {
    setClusterToExpand(null);
    setSelectedProject(project);
    setActiveProjectId(project?.projectId || "");
  }, []);

  const handleClusterSelect = useCallback((cluster) => {
    setSelectedProject(null);
    setActiveProjectId(cluster?.clusterId || "");
    setClusterToExpand(cluster);
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt hiện tại không hỗ trợ định vị.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(nextLocation);
        setLocateRequestId((prev) => prev + 1);
        setIsLocating(false);
      },
      () => {
        toast.error("Không thể lấy vị trí hiện tại của bạn.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const handleResetVietnam = useCallback(() => {
    resetSelection();
    setResetRequestId((prev) => prev + 1);
  }, [resetSelection]);

  const summaryText = useMemo(
    () => formatVisibleSummaryText(normalized.summary, normalized.mode),
    [normalized.summary, normalized.mode]
  );

  return (
    <div className="h-[calc(100vh-88px)] overflow-hidden bg-[#FFF8E6]">
      <div className="mx-auto flex h-full max-w-[1720px] flex-col px-4 py-4 sm:px-5 lg:px-6">
        <div className="mb-4 flex-shrink-0">
          <ProjectMapToolbar
            summaryText={summaryText}
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            filters={filters}
            onCategoryChange={handleCategoryChange}
            onOrganizerScopeChange={handleOrganizerScopeChange}
            onLocateMe={handleLocateMe}
            onResetVietnam={handleResetVietnam}
            isLocating={isLocating}
          />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="min-h-0">
            <ProjectMapSidebar
              panelProjects={normalized.panelProjects}
              activeProjectId={activeProjectId}
              onProjectSelect={handleProjectSelect}
              isLoading={isLoading}
              isFetching={isFetching}
            />
          </div>

          <div className="relative min-h-0">
            <ProjectMapCanvas
              items={normalized.items}
              activeProjectId={activeProjectId}
              onProjectSelect={handleProjectSelect}
              onClusterSelect={handleClusterSelect}
              onViewportChange={handleViewportChange}
              selectedProject={selectedProject}
              clusterToExpand={clusterToExpand}
              userLocation={userLocation}
              locateRequestId={locateRequestId}
              resetRequestId={resetRequestId}
            />

            {isFetching ? (
              <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-amber-200 bg-white/95 px-4 py-2 text-sm font-bold text-amber-700 shadow-lg backdrop-blur">
                Đang cập nhật bản đồ...
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}