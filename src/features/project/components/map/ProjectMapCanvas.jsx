import { memo, useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { LocateFixed, MapPin } from "lucide-react";

import {
  MAP_PROJECT_MODE_SWITCH_ZOOM,
  VIETNAM_DEFAULT_ZOOM,
  VIETNAM_MAP_BOUNDS,
  VIETNAM_MAP_CENTER,
  getClusterBadgeSizeClass,
  getClusterIconPixelSize,
  isClusterItem,
  isProjectItem,
} from "../../utils/projectMap.utils";
import {
  getProjectCategoryLabel,
  getProjectFundingStats,
  getProjectVolunteerStats,
} from "../../utils/projectDisplay.utils";

const BRAND_YELLOW = "#FBBF24";
const MAP_SOFT_YELLOW = "#FFF8E6";
const BRAND_TEXT = "#111827";

function MapViewportWatcher({ onViewportChange }) {
  const map = useMap();
  const lastViewportRef = useRef("");

  useEffect(() => {
    const syncViewport = () => {
      const bounds = map.getBounds();
      const nextViewport = {
        north: Number(bounds.getNorth().toFixed(5)),
        south: Number(bounds.getSouth().toFixed(5)),
        east: Number(bounds.getEast().toFixed(5)),
        west: Number(bounds.getWest().toFixed(5)),
        zoom: map.getZoom(),
      };

      const signature = JSON.stringify(nextViewport);
      if (lastViewportRef.current === signature) return;

      lastViewportRef.current = signature;
      onViewportChange?.(nextViewport);
    };

    syncViewport();
  }, [map, onViewportChange]);

  useMapEvents({
    moveend(event) {
      const nextMap = event.target;
      const bounds = nextMap.getBounds();

      const nextViewport = {
        north: Number(bounds.getNorth().toFixed(5)),
        south: Number(bounds.getSouth().toFixed(5)),
        east: Number(bounds.getEast().toFixed(5)),
        west: Number(bounds.getWest().toFixed(5)),
        zoom: nextMap.getZoom(),
      };

      const signature = JSON.stringify(nextViewport);
      if (lastViewportRef.current === signature) return;

      lastViewportRef.current = signature;
      onViewportChange?.(nextViewport);
    },
  });

  return null;
}

function MapResizeController() {
  const map = useMap();

  useEffect(() => {
    const safeInvalidate = () => {
      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
      });
    };

    safeInvalidate();

    const timeoutId = window.setTimeout(safeInvalidate, 120);

    const container = map.getContainer();
    if (!container || typeof ResizeObserver === "undefined") {
      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    const observer = new ResizeObserver(() => {
      safeInvalidate();
    });

    observer.observe(container);
    window.addEventListener("resize", safeInvalidate);

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener("resize", safeInvalidate);
    };
  }, [map]);

  return null;
}

function MapProgrammaticController({
  selectedProject,
  clusterToExpand,
  locateRequestId,
  userLocation,
  resetRequestId,
}) {
  const map = useMap();
  const lastLocateRequestId = useRef(0);
  const lastResetRequestId = useRef(0);
  const lastClusterKey = useRef("");
  const lastProjectId = useRef("");

  useEffect(() => {
    if (!selectedProject?.projectId) return;
    if (lastProjectId.current === selectedProject.projectId) return;

    lastProjectId.current = selectedProject.projectId;
    map.flyTo(
      [selectedProject.latitude, selectedProject.longitude],
      Math.max(map.getZoom(), MAP_PROJECT_MODE_SWITCH_ZOOM + 1),
      {
        animate: true,
        duration: 0.7,
      }
    );
  }, [map, selectedProject]);

  useEffect(() => {
    if (!clusterToExpand?.clusterId) return;
    if (lastClusterKey.current === clusterToExpand.clusterId) return;

    lastClusterKey.current = clusterToExpand.clusterId;

    map.flyTo(
      [clusterToExpand.latitude, clusterToExpand.longitude],
      Math.max(
        clusterToExpand.expandZoom || MAP_PROJECT_MODE_SWITCH_ZOOM,
        map.getZoom() + 2
      ),
      {
        animate: true,
        duration: 0.65,
      }
    );
  }, [map, clusterToExpand]);

  useEffect(() => {
    if (!locateRequestId || lastLocateRequestId.current === locateRequestId) {
      return;
    }

    lastLocateRequestId.current = locateRequestId;

    if (!userLocation) return;

    map.flyTo([userLocation.latitude, userLocation.longitude], 13, {
      animate: true,
      duration: 0.7,
    });
  }, [locateRequestId, map, userLocation]);

  useEffect(() => {
    if (!resetRequestId || lastResetRequestId.current === resetRequestId) {
      return;
    }

    lastResetRequestId.current = resetRequestId;

    map.fitBounds(VIETNAM_MAP_BOUNDS, {
      padding: [32, 32],
      animate: true,
      duration: 0.7,
    });
  }, [map, resetRequestId]);

  return null;
}

const clusterIconCache = new Map();
const userLocationIconCache = new Map();

function createClusterIcon(cluster, isActive) {
  const cacheKey = `${cluster.count}-${isActive ? "1" : "0"}`;
  if (clusterIconCache.has(cacheKey)) {
    return clusterIconCache.get(cacheKey);
  }

  const sizeClass = getClusterBadgeSizeClass(cluster.count);
  const iconPixelSize = getClusterIconPixelSize(cluster.count);
  const iconAnchor = Math.round(iconPixelSize / 2);

  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute ${
        isActive
          ? "h-[calc(100%+26px)] w-[calc(100%+26px)] bg-[rgba(251,191,36,0.30)]"
          : "h-[calc(100%+20px)] w-[calc(100%+20px)] bg-[rgba(251,191,36,0.18)]"
      } rounded-full"></div>
      <div class="absolute ${
        isActive
          ? "h-[calc(100%+12px)] w-[calc(100%+12px)] bg-[rgba(251,191,36,0.14)]"
          : "h-[calc(100%+8px)] w-[calc(100%+8px)] bg-[rgba(251,191,36,0.08)]"
      } rounded-full"></div>
      <div class="relative flex ${sizeClass} items-center justify-center rounded-full border-[5px] ${
        isActive
          ? "border-[#111827] bg-[#FBBF24] text-[#111827] shadow-[0_14px_28px_rgba(17,24,39,0.22)] scale-105"
          : "border-white bg-[#FBBF24] text-[#111827] shadow-[0_10px_22px_rgba(17,24,39,0.16)]"
      } font-black tracking-tight transition-all">
        ${cluster.count}
      </div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: "bg-transparent border-0",
    iconSize: [iconPixelSize, iconPixelSize],
    iconAnchor: [iconAnchor, iconAnchor],
  });

  clusterIconCache.set(cacheKey, icon);
  return icon;
}

function createUserLocationIcon() {
  if (userLocationIconCache.has("default")) {
    return userLocationIconCache.get("default");
  }

  const html = `
    <div class="relative flex h-8 w-8 items-center justify-center">
      <div class="absolute h-8 w-8 rounded-full bg-sky-500/20 animate-pulse"></div>
      <div class="absolute h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-lg"></div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: "bg-transparent border-0",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  userLocationIconCache.set("default", icon);
  return icon;
}

function ProjectPopupContent({ project }) {
  const funding = getProjectFundingStats(project.raw || project);
  const volunteer = getProjectVolunteerStats(project.raw || project);

  return (
    <div className="w-[260px]">
      <img
        src={project.coverImage}
        alt={project.title}
        className="h-32 w-full rounded-2xl object-cover"
      />

      <div className="mt-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            {getProjectCategoryLabel(project.category)}
          </span>

          {project.isUrgent ? (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
              Khẩn cấp
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
          {project.title}
        </h3>

        <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin size={13} className="mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{project.address}</span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-slate-500">
          {project.summary}
        </p>

        {Number(funding.targetAmount || 0) > 0 ? (
          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Gây quỹ</span>
              <span>{funding.fundingPercent}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${funding.fundingPercent}%`,
                  backgroundColor: BRAND_YELLOW,
                }}
              />
            </div>
          </div>
        ) : null}

        {(project.needsVolunteers ||
          Number(volunteer.targetVolunteers || 0) > 0) ? (
          <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Tình nguyện viên</span>
              <span>{volunteer.volunteerPercent}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${volunteer.volunteerPercent}%` }}
              />
            </div>
          </div>
        ) : null}

        <Link
          to={`/projects/${project.projectId}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:opacity-95"
          style={{ backgroundColor: BRAND_YELLOW }}
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

function ProjectMapCanvasComponent({
  items,
  activeProjectId,
  onProjectSelect,
  onClusterSelect,
  onViewportChange,
  selectedProject,
  clusterToExpand,
  userLocation,
  locateRequestId,
  resetRequestId,
}) {
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);
  const safeItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  );

  return (
    <div
      className="h-full w-full overflow-hidden rounded-[32px] border border-amber-100 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
      style={{ backgroundColor: MAP_SOFT_YELLOW }}
    >
      <style>{`
        .project-map-surface .leaflet-container {
          background: ${MAP_SOFT_YELLOW} !important;
          height: 100% !important;
          width: 100% !important;
        }
        .project-map-surface .leaflet-control-zoom a {
          background: #ffffff !important;
          color: #111827 !important;
          border-color: #fde68a !important;
        }
        .project-map-surface .leaflet-control-zoom a:hover {
          background: #fef3c7 !important;
        }
        .project-map-surface .leaflet-popup-content-wrapper {
          border-radius: 18px !important;
        }
        .project-map-surface .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>

      <div className="project-map-surface h-full w-full">
        <MapContainer
          center={VIETNAM_MAP_CENTER}
          zoom={VIETNAM_DEFAULT_ZOOM}
          minZoom={5}
          zoomControl={false}
          className="h-full w-full"
          style={{ backgroundColor: MAP_SOFT_YELLOW, height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ZoomControl position="bottomright" />

          <MapResizeController />
          <MapViewportWatcher onViewportChange={onViewportChange} />

          <MapProgrammaticController
            selectedProject={selectedProject}
            clusterToExpand={clusterToExpand}
            locateRequestId={locateRequestId}
            userLocation={userLocation}
            resetRequestId={resetRequestId}
          />

          {safeItems.map((item) => {
            if (isClusterItem(item)) {
              const isActive = activeProjectId === item.clusterId;

              return (
                <Marker
                  key={item.clusterId}
                  position={[item.latitude, item.longitude]}
                  icon={createClusterIcon(item, isActive)}
                  eventHandlers={{
                    click: () => onClusterSelect?.(item),
                  }}
                >
                  <Popup>
                    <div className="w-[220px]">
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.count} dự án trong khu vực này
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Bấm vào cụm để phóng to và xem từng dự án chi tiết hơn.
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            }

            if (isProjectItem(item)) {
              const isActive = activeProjectId === item.projectId;

              return (
                <CircleMarker
                  key={item.projectId}
                  center={[item.latitude, item.longitude]}
                  radius={isActive ? 16 : 13}
                  pathOptions={{
                    color: isActive ? BRAND_TEXT : "#ffffff",
                    weight: isActive ? 6 : 5,
                    fillColor: BRAND_YELLOW,
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () => onProjectSelect?.(item),
                  }}
                >
                  <Popup>
                    <ProjectPopupContent project={item} />
                  </Popup>
                </CircleMarker>
              );
            }

            return null;
          })}

          {userLocation ? (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="flex items-center gap-2">
                  <LocateFixed size={16} className="text-sky-500" />
                  <span className="text-sm font-semibold text-slate-900">
                    Vị trí hiện tại của bạn
                  </span>
                </div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}

const ProjectMapCanvas = memo(
  ProjectMapCanvasComponent,
  (prevProps, nextProps) =>
    prevProps.items === nextProps.items &&
    prevProps.activeProjectId === nextProps.activeProjectId &&
    prevProps.onProjectSelect === nextProps.onProjectSelect &&
    prevProps.onClusterSelect === nextProps.onClusterSelect &&
    prevProps.onViewportChange === nextProps.onViewportChange &&
    prevProps.selectedProject === nextProps.selectedProject &&
    prevProps.clusterToExpand === nextProps.clusterToExpand &&
    prevProps.userLocation === nextProps.userLocation &&
    prevProps.locateRequestId === nextProps.locateRequestId &&
    prevProps.resetRequestId === nextProps.resetRequestId
);

export default ProjectMapCanvas;