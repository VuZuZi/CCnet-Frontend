import { memo, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { LocateFixed, MapPin } from 'lucide-react';

import {
  NEED_HELP_CLUSTER_SWITCH_ZOOM,
  VIETNAM_DEFAULT_ZOOM,
  VIETNAM_MAP_BOUNDS,
  VIETNAM_MAP_CENTER,
  getClusterBadgeSizeClass,
  getClusterIconPixelSize,
  getUrgencyBadgeClass,
  getUrgencyLabel,
} from '../../utils/helpRequestMap.utils';

const BRAND_YELLOW = '#FBBF24';
const MAP_SOFT_YELLOW = '#FFF8E6';

function MapViewportWatcher({ onViewportChange }) {
  const map = useMap();
  const lastViewportRef = useRef('');

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
    zoomend(event) {
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
    if (!container || typeof ResizeObserver === 'undefined') {
      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    const observer = new ResizeObserver(() => {
      safeInvalidate();
    });

    observer.observe(container);
    window.addEventListener('resize', safeInvalidate);

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener('resize', safeInvalidate);
    };
  }, [map]);

  return null;
}

function MapProgrammaticController({
  selectedItem,
  selectedCluster,
  locateRequestId,
  userLocation,
  resetRequestId,
}) {
  const map = useMap();
  const lastLocateRequestId = useRef(0);
  const lastResetRequestId = useRef(0);
  const lastItemId = useRef('');
  const lastClusterId = useRef('');

  useEffect(() => {
    if (!selectedItem?.id) return;
    if (lastItemId.current === selectedItem.id) return;

    lastItemId.current = selectedItem.id;

    map.flyTo(
      [selectedItem.latitude, selectedItem.longitude],
      Math.max(map.getZoom(), NEED_HELP_CLUSTER_SWITCH_ZOOM + 1),
      {
        animate: true,
        duration: 0.65,
      }
    );
  }, [map, selectedItem]);

  useEffect(() => {
    if (!selectedCluster?.clusterId) return;
    if (lastClusterId.current === selectedCluster.clusterId) return;

    lastClusterId.current = selectedCluster.clusterId;

    map.flyTo(
      [selectedCluster.latitude, selectedCluster.longitude],
      selectedCluster.expandZoom || Math.max(map.getZoom() + 2, 10),
      {
        animate: true,
        duration: 0.6,
      }
    );
  }, [map, selectedCluster]);

  useEffect(() => {
    if (!locateRequestId || lastLocateRequestId.current === locateRequestId) {
      return;
    }

    lastLocateRequestId.current = locateRequestId;

    if (!userLocation) return;

    map.flyTo([userLocation.latitude, userLocation.longitude], 13, {
      animate: true,
      duration: 0.65,
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
      duration: 0.65,
    });
  }, [map, resetRequestId]);

  return null;
}

const clusterIconCache = new Map();
const itemIconCache = new Map();

function createClusterIcon(cluster, isActive) {
  const cacheKey = `${cluster.count}-${isActive ? '1' : '0'}`;
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
          ? 'h-[calc(100%+34px)] w-[calc(100%+34px)] bg-[rgba(251,191,36,0.36)]'
          : 'h-[calc(100%+28px)] w-[calc(100%+28px)] bg-[rgba(251,191,36,0.24)]'
      } rounded-full"></div>
      <div class="absolute ${
        isActive
          ? 'h-[calc(100%+18px)] w-[calc(100%+18px)] bg-[rgba(251,191,36,0.18)]'
          : 'h-[calc(100%+14px)] w-[calc(100%+14px)] bg-[rgba(251,191,36,0.12)]'
      } rounded-full"></div>
      <div class="relative flex ${sizeClass} items-center justify-center rounded-full border-[6px] ${
        isActive
          ? 'border-[#111827] bg-[#FBBF24] text-[#111827] shadow-[0_18px_38px_rgba(17,24,39,0.26)] scale-110'
          : 'border-white bg-[#FBBF24] text-[#111827] shadow-[0_14px_30px_rgba(17,24,39,0.20)]'
      } font-black tracking-tight transition-all">
        ${cluster.count}
      </div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: 'bg-transparent border-0',
    iconSize: [iconPixelSize, iconPixelSize],
    iconAnchor: [iconAnchor, iconAnchor],
  });

  clusterIconCache.set(cacheKey, icon);
  return icon;
}

function createItemIcon(isActive) {
  const cacheKey = isActive ? 'active' : 'default';
  if (itemIconCache.has(cacheKey)) {
    return itemIconCache.get(cacheKey);
  }

  const iconSize = isActive ? 62 : 54;
  const anchor = Math.round(iconSize / 2);

  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute ${
        isActive
          ? 'h-[72px] w-[72px] bg-[rgba(251,191,36,0.32)]'
          : 'h-[62px] w-[62px] bg-[rgba(251,191,36,0.24)]'
      } rounded-full"></div>
      <div class="absolute ${
        isActive
          ? 'h-[56px] w-[56px] bg-[rgba(251,191,36,0.16)]'
          : 'h-[48px] w-[48px] bg-[rgba(251,191,36,0.10)]'
      } rounded-full"></div>
      <div class="relative flex ${
        isActive ? 'h-[40px] w-[40px]' : 'h-[34px] w-[34px]'
      } items-center justify-center rounded-full border-[5px] ${
        isActive
          ? 'border-[#111827] bg-[#FBBF24] text-[#111827] shadow-[0_14px_28px_rgba(17,24,39,0.24)]'
          : 'border-white bg-[#FBBF24] text-[#111827] shadow-[0_12px_22px_rgba(17,24,39,0.18)]'
      } font-black text-[13px] leading-none transition-all">
        1
      </div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: 'bg-transparent border-0',
    iconSize: [iconSize, iconSize],
    iconAnchor: [anchor, anchor],
  });

  itemIconCache.set(cacheKey, icon);
  return icon;
}

function createUserLocationIcon() {
  const html = `
    <div class="relative flex h-8 w-8 items-center justify-center">
      <div class="absolute h-8 w-8 rounded-full bg-sky-500/20 animate-pulse"></div>
      <div class="absolute h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-lg"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function NeedHelpPopupContent({ item }) {
  return (
    <div className="w-[260px]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${getUrgencyBadgeClass(
            item.urgencyLevel
          )}`}
        >
          {getUrgencyLabel(item.urgencyLevel)}
        </span>

        {item.category ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            {item.categoryLabel || item.category}
          </span>
        ) : null}
      </div>

      <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
        {item.title}
      </h3>

      <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
        <MapPin size={13} className="mt-0.5 shrink-0" />
        <span className="line-clamp-2">{item.address}</span>
      </div>

      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
        {item.story || 'Yêu cầu trợ giúp này đang chờ được xem xét và hỗ trợ.'}
      </p>

      {Number(item.amountNeeded || 0) > 0 ? (
        <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-500">
            Mức hỗ trợ cần thiết
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            {Number(item.amountNeeded || 0).toLocaleString('vi-VN')} đ
          </div>
        </div>
      ) : null}

      <Link
        to={`/need-help/${item.id}`}
        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:opacity-95"
        style={{ backgroundColor: BRAND_YELLOW }}
      >
        Xem chi tiết
      </Link>
    </div>
  );
}

function NeedHelpMapCanvasComponent({
  markers,
  activeItemId,
  activeClusterId,
  onItemSelect,
  onClusterSelect,
  onViewportChange,
  selectedItem,
  selectedCluster,
  userLocation,
  locateRequestId,
  resetRequestId,
}) {
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);
  const safeMarkers = useMemo(
    () => (Array.isArray(markers) ? markers : []),
    [markers]
  );

  return (
    <div
      className="h-full w-full overflow-hidden rounded-[32px] border border-amber-100 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
      style={{ backgroundColor: MAP_SOFT_YELLOW }}
    >
      <style>{`
        .needhelp-map-surface .leaflet-container {
          background: ${MAP_SOFT_YELLOW} !important;
          height: 100% !important;
          width: 100% !important;
        }
        .needhelp-map-surface .leaflet-control-zoom a {
          background: #ffffff !important;
          color: #111827 !important;
          border-color: #fde68a !important;
        }
        .needhelp-map-surface .leaflet-control-zoom a:hover {
          background: #fef3c7 !important;
        }
        .needhelp-map-surface .leaflet-popup-content-wrapper {
          border-radius: 18px !important;
        }
        .needhelp-map-surface .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>

      <div className="needhelp-map-surface h-full w-full">
        <MapContainer
          center={VIETNAM_MAP_CENTER}
          zoom={VIETNAM_DEFAULT_ZOOM}
          minZoom={5}
          zoomControl={false}
          className="h-full w-full"
          style={{ backgroundColor: MAP_SOFT_YELLOW, height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ZoomControl position="bottomright" />
          <MapResizeController />
          <MapViewportWatcher onViewportChange={onViewportChange} />

          <MapProgrammaticController
            selectedItem={selectedItem}
            selectedCluster={selectedCluster}
            locateRequestId={locateRequestId}
            userLocation={userLocation}
            resetRequestId={resetRequestId}
          />

          {safeMarkers.map((item) => {
            if (item.type === 'cluster') {
              const isActive = activeClusterId === item.clusterId;

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
                        {item.count} yêu cầu trong khu vực này
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Bấm vào cụm để zoom sâu hơn và xem chi tiết từng yêu cầu.
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            }

            const isActive = activeItemId === item.id;

            return (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={createItemIcon(isActive)}
                eventHandlers={{
                  click: () => onItemSelect?.(item),
                }}
              >
                <Popup>
                  <NeedHelpPopupContent item={item} />
                </Popup>
              </Marker>
            );
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

const NeedHelpMapCanvas = memo(
  NeedHelpMapCanvasComponent,
  (prevProps, nextProps) =>
    prevProps.markers === nextProps.markers &&
    prevProps.activeItemId === nextProps.activeItemId &&
    prevProps.activeClusterId === nextProps.activeClusterId &&
    prevProps.onItemSelect === nextProps.onItemSelect &&
    prevProps.onClusterSelect === nextProps.onClusterSelect &&
    prevProps.onViewportChange === nextProps.onViewportChange &&
    prevProps.selectedItem === nextProps.selectedItem &&
    prevProps.selectedCluster === nextProps.selectedCluster &&
    prevProps.userLocation === nextProps.userLocation &&
    prevProps.locateRequestId === nextProps.locateRequestId &&
    prevProps.resetRequestId === nextProps.resetRequestId
);

export default NeedHelpMapCanvas;