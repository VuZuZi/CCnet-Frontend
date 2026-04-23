import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, PanelLeftOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useHelpRequestMapViewport } from '../../hooks/useHelpRequestQueries';
import {
  buildViewportSignature,
  formatNeedHelpMapSummary,
  getCategoryLabel,
  limitSidebarItems,
} from '../../utils/helpRequestMap.utils';
import NeedHelpMapToolbar from './NeedHelpMapToolbar';
import NeedHelpMapSidebar from './NeedHelpMapSidebar';
import NeedHelpMapCanvas from './NeedHelpMapCanvas';

const INITIAL_FILTERS = {
  search: '',
  category: '',
  urgencyLevel: '',
};

const MIN_VIEWPORT_DELTA = 0.0001;

const normalizeMapItem = (item) => {
  if (!item) return null;

  const coordinates = item?.coordinates || item?.location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const [longitude, latitude] = coordinates.map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const category = item?.category || 'KHAC';

  return {
    type: 'item',
    id: String(item?.id || item?._id || ''),
    title: item?.title || 'Yêu cầu trợ giúp',
    story: item?.story || '',
    urgencyLevel: item?.urgencyLevel || 'MEDIUM',
    category,
    categoryLabel: item?.categoryLabel || getCategoryLabel(category),
    status: item?.status || '',
    address: item?.address || item?.location?.address || 'Chưa có địa điểm cụ thể',
    amountNeeded: Number(item?.amountNeeded || 0),
    latitude,
    longitude,
    raw: item,
  };
};

const normalizeMapResponse = (data = {}) => {
  const mode = data?.mode === 'item' ? 'item' : 'cluster';
  const rawItems = Array.isArray(data?.items) ? data.items : [];
  const rawPanelItems = Array.isArray(data?.panelItems) ? data.panelItems : [];
  const summary = data?.summary || {};

  const markers = rawItems
    .map((item) => {
      if (item?.type === 'cluster') {
        const latitude = Number(item?.latitude);
        const longitude = Number(item?.longitude);
        const count = Number(item?.count || 0);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || count <= 0) {
          return null;
        }

        return {
          type: 'cluster',
          clusterId: String(item?.clusterId || ''),
          rawClusterId: item?.rawClusterId,
          count,
          latitude,
          longitude,
          expandZoom: Number(item?.expandZoom || 11),
        };
      }

      return normalizeMapItem(item);
    })
    .filter(Boolean);

  const panelItems = rawPanelItems.map(normalizeMapItem).filter(Boolean);

  return {
    mode,
    markers,
    panelItems,
    summary: {
      totalVisible: Number(summary?.totalVisible || 0),
      itemCount: Number(summary?.itemCount || 0),
      clusterCount: Number(summary?.clusterCount || 0),
      requestCount: Number(summary?.requestCount || 0),
      zoom: Number(summary?.zoom || 6),
    },
  };
};

const normalizeViewportForQuery = (viewport) => {
  if (!viewport) return null;

  let north = Number(viewport.north);
  let south = Number(viewport.south);
  let east = Number(viewport.east);
  let west = Number(viewport.west);
  const zoom = Number(viewport.zoom || 6);

  if (
    !Number.isFinite(north) ||
    !Number.isFinite(south) ||
    !Number.isFinite(east) ||
    !Number.isFinite(west)
  ) {
    return null;
  }

  if (north < south) {
    [north, south] = [south, north];
  }

  if (east < west) {
    [east, west] = [west, east];
  }

  if (Math.abs(north - south) < MIN_VIEWPORT_DELTA) {
    north += MIN_VIEWPORT_DELTA / 2;
    south -= MIN_VIEWPORT_DELTA / 2;
  }

  if (Math.abs(east - west) < MIN_VIEWPORT_DELTA) {
    east += MIN_VIEWPORT_DELTA / 2;
    west -= MIN_VIEWPORT_DELTA / 2;
  }

  return {
    north: Number(north.toFixed(5)),
    south: Number(south.toFixed(5)),
    east: Number(east.toFixed(5)),
    west: Number(west.toFixed(5)),
    zoom,
  };
};

export default function NeedHelpMapShell() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 250);

  const [viewport, setViewport] = useState(null);
  const viewportFrameRef = useRef(0);
  const lastViewportSignatureRef = useRef('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [activeItemId, setActiveItemId] = useState('');
  const [activeClusterId, setActiveClusterId] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locateRequestId, setLocateRequestId] = useState(0);
  const [resetRequestId, setResetRequestId] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyBackground = document.body.style.backgroundColor;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = 'rgb(255,248,230)';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, []);

  const normalizedViewport = useMemo(
    () => normalizeViewportForQuery(viewport),
    [viewport]
  );

  const queryParams = useMemo(() => {
    if (!normalizedViewport) return null;

    return {
      north: normalizedViewport.north,
      south: normalizedViewport.south,
      east: normalizedViewport.east,
      west: normalizedViewport.west,
      zoom: Number(normalizedViewport.zoom || 6),
      category: filters.category || undefined,
      urgencyLevel: filters.urgencyLevel || undefined,
      search: debouncedSearch || undefined,
    };
  }, [normalizedViewport, filters.category, filters.urgencyLevel, debouncedSearch]);

  const { data, isLoading, isFetching } = useHelpRequestMapViewport(
    queryParams || {},
    Boolean(queryParams)
  );

  const normalized = useMemo(() => normalizeMapResponse(data || {}), [data]);

  const sidebarItems = useMemo(
    () => limitSidebarItems(normalized.panelItems),
    [normalized.panelItems]
  );

  const summaryText = useMemo(
    () =>
      formatNeedHelpMapSummary({
        total: normalized.summary.requestCount,
        visible: normalized.summary.totalVisible,
        clusterCount: normalized.summary.clusterCount,
        mode: normalized.mode,
      }),
    [normalized]
  );

  const hasActiveFilters = Boolean(
    debouncedSearch || filters.category || filters.urgencyLevel
  );

  const handleViewportChange = useCallback((nextViewport) => {
    cancelAnimationFrame(viewportFrameRef.current);

    viewportFrameRef.current = requestAnimationFrame(() => {
      const safeViewport = normalizeViewportForQuery(nextViewport);
      if (!safeViewport) return;

      const nextSignature = buildViewportSignature(safeViewport);
      if (lastViewportSignatureRef.current === nextSignature) return;

      lastViewportSignatureRef.current = nextSignature;
      setViewport(safeViewport);
    });
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(viewportFrameRef.current);
    };
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedItem(null);
    setSelectedCluster(null);
    setActiveItemId('');
    setActiveClusterId('');
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

  const handleUrgencyChange = useCallback(
    (event) => {
      resetSelection();
      setFilters((prev) => ({
        ...prev,
        urgencyLevel: event.target.value,
      }));
    },
    [resetSelection]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setLocalSearch('');
    resetSelection();
  }, [resetSelection]);

  const handleItemSelect = useCallback((item) => {
    setSelectedCluster(null);
    setActiveClusterId('');
    setSelectedItem(item);
    setActiveItemId(item?.id || '');
  }, []);

  const handleClusterSelect = useCallback((cluster) => {
    setSelectedItem(null);
    setActiveItemId('');
    setSelectedCluster(cluster);
    setActiveClusterId(cluster?.clusterId || '');
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt hiện tại không hỗ trợ định vị.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocateRequestId((prev) => prev + 1);
        setIsLocating(false);
      },
      () => {
        toast.error('Không thể lấy vị trí hiện tại của bạn.');
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

  return (
    <div className="h-[calc(100dvh-88px)] min-h-[560px] overflow-hidden bg-[rgb(255,248,230)]">
      <div className="relative h-full w-full min-w-0 overflow-hidden rounded-[24px] border border-amber-100 shadow-[0_28px_80px_rgba(15,23,42,0.12)] sm:rounded-[34px]">
        <NeedHelpMapCanvas
          markers={normalized.markers}
          activeItemId={activeItemId}
          activeClusterId={activeClusterId}
          onItemSelect={handleItemSelect}
          onClusterSelect={handleClusterSelect}
          onViewportChange={handleViewportChange}
          selectedItem={selectedItem}
          selectedCluster={selectedCluster}
          userLocation={userLocation}
          locateRequestId={locateRequestId}
          resetRequestId={resetRequestId}
        />

        <div className="pointer-events-none absolute inset-x-6 top-5 z-[2300]">
          <NeedHelpMapToolbar
            summaryText={summaryText}
            localSearch={localSearch}
            setLocalSearch={setLocalSearch}
            filters={filters}
            onCategoryChange={handleCategoryChange}
            onUrgencyChange={handleUrgencyChange}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            onLocateMe={handleLocateMe}
            onResetVietnam={handleResetVietnam}
            isLocating={isLocating}
          />
        </div>

        <NeedHelpMapSidebar
          visibleItems={sidebarItems}
          activeItemId={activeItemId}
          onItemSelect={handleItemSelect}
          isLoading={isLoading}
          summaryText={summaryText}
          isOpen={isSidebarOpen}
        />

        {isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            style={{ left: "min(calc(100vw - 76px), 389px)" }}
            className="pointer-events-auto absolute top-[146px] z-[2400] flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/92 text-slate-700 shadow-[0_18px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:bg-white"
            aria-label="Đóng danh sách"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="pointer-events-auto absolute left-6 top-[146px] z-[2400] inline-flex h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/92 px-4 text-sm font-bold text-slate-800 shadow-[0_18px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:bg-white"
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
