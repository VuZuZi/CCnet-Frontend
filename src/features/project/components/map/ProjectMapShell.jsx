import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, PanelLeftOpen } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput.trim(),
      }));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyBackground = document.body.style.backgroundColor;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "rgb(255,248,230)";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, []);

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
      <div className="relative h-full w-full overflow-hidden rounded-[34px] border border-amber-100 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
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

        <div className="pointer-events-none absolute inset-x-6 top-5 z-[2300]">
          <ProjectMapToolbar
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

        <ProjectMapSidebar
          panelProjects={normalized.panelProjects}
          activeProjectId={activeProjectId}
          onProjectSelect={handleProjectSelect}
          isLoading={isLoading}
          summaryText={summaryText}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(false)}
        />

        {isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="pointer-events-auto absolute left-[389px] top-[144px] z-[2400] flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/92 text-slate-700 shadow-[0_18px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:bg-white"
            aria-label="Đóng danh sách"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="pointer-events-auto absolute left-6 top-[144px] z-[2400] inline-flex h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/92 px-4 text-sm font-bold text-slate-800 shadow-[0_18px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:bg-white"
          >
            <PanelLeftOpen size={18} />
            Mở danh sách
          </button>
        )}

        {isFetching ? (
          <div className="pointer-events-none absolute right-6 top-[96px] z-[2300] rounded-full bg-white/94 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur">
            Đang cập nhật bản đồ...
          </div>
        ) : null}
      </div>
    </div>
  );
}