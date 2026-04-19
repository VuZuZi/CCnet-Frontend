import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Supercluster from 'supercluster';
import { toast } from 'react-toastify';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useHelpRequestMap } from '../../hooks/useHelpRequestQueries';
import {
  DEFAULT_VIETNAM_BBOX,
  VIETNAM_DEFAULT_ZOOM,
  applyNeedHelpMapFilters,
  formatNeedHelpMapSummary,
  getVisibleItemsFromViewport,
  normalizeNeedHelpMapItems,
  sortNeedHelpItems,
  toNeedHelpGeoJsonPoints,
} from '../../utils/helpRequestMap.utils';
import NeedHelpMapToolbar from './NeedHelpMapToolbar';
import NeedHelpMapSidebar from './NeedHelpMapSidebar';
import NeedHelpMapCanvas from './NeedHelpMapCanvas';

const INITIAL_FILTERS = {
  search: '',
  category: '',
  urgencyLevel: '',
};

export default function NeedHelpMapShell() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 250);

  const [viewport, setViewport] = useState(null);
  const viewportFrameRef = useRef(0);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [activeItemId, setActiveItemId] = useState('');
  const [activeClusterId, setActiveClusterId] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locateRequestId, setLocateRequestId] = useState(0);
  const [resetRequestId, setResetRequestId] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  const { data, isLoading, isFetching } = useHelpRequestMap(true);

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

  const normalizedItems = useMemo(
    () => normalizeNeedHelpMapItems(data || []),
    [data]
  );

  const mergedFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch]
  );

  const hasActiveFilters = Boolean(
    mergedFilters.search || mergedFilters.category || mergedFilters.urgencyLevel
  );

  const filteredItems = useMemo(
    () => applyNeedHelpMapFilters(normalizedItems, mergedFilters),
    [normalizedItems, mergedFilters]
  );

  const visibleItems = useMemo(
    () => sortNeedHelpItems(getVisibleItemsFromViewport(filteredItems, viewport)),
    [filteredItems, viewport]
  );

  const sidebarItems = useMemo(
    () => visibleItems,
    [visibleItems]
  );

  const geoJsonPoints = useMemo(
    () => toNeedHelpGeoJsonPoints(filteredItems),
    [filteredItems]
  );

  const clusterIndex = useMemo(() => {
    const index = new Supercluster({
      radius: 70,
      maxZoom: 18,
      minZoom: 0,
      minPoints: 2,
      nodeSize: 64,
    });

    index.load(geoJsonPoints);
    return index;
  }, [geoJsonPoints]);

  const currentBbox = useMemo(() => {
    if (!viewport) return DEFAULT_VIETNAM_BBOX;

    return [
      viewport.west,
      viewport.south,
      viewport.east,
      viewport.north,
    ];
  }, [viewport]);

  const markerResult = useMemo(() => {
    const zoom = Math.max(0, Math.min(18, Math.round(viewport?.zoom || VIETNAM_DEFAULT_ZOOM)));
    const clusters = clusterIndex.getClusters(currentBbox, zoom);

    const markers = clusters.map((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const props = feature.properties || {};

      if (props.cluster) {
        const clusterId = props.cluster_id;
        return {
          type: 'cluster',
          clusterId: `cluster-${clusterId}`,
          rawClusterId: clusterId,
          count: props.point_count || 0,
          latitude,
          longitude,
          expandZoom: clusterIndex.getClusterExpansionZoom(clusterId),
        };
      }

      return {
        type: 'item',
        id: String(props.id || ''),
        title: props.title || 'Yêu cầu trợ giúp',
        story: props.story || '',
        urgencyLevel: props.urgencyLevel || 'MEDIUM',
        category: props.category || 'KHAC',
        categoryLabel: props.categoryLabel || '',
        status: props.status || '',
        address: props.address || 'Chưa có địa điểm cụ thể',
        latitude,
        longitude,
      };
    });

    let clusterCount = 0;
    for (const item of markers) {
      if (item.type === 'cluster') clusterCount += 1;
    }

    return {
      mode: clusterCount > 0 ? 'cluster' : 'item',
      markers,
      clusterCount,
    };
  }, [clusterIndex, currentBbox, viewport?.zoom]);

  const summaryText = useMemo(
    () =>
      formatNeedHelpMapSummary({
        total: filteredItems.length,
        visible: visibleItems.length,
        clusterCount: markerResult.clusterCount,
        mode: markerResult.mode,
      }),
    [filteredItems.length, visibleItems.length, markerResult.clusterCount, markerResult.mode]
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
    setSelectedItem(null);
    setSelectedCluster(null);
    setActiveItemId('');
    setActiveClusterId('');
  }, []);

  const handleCategoryChange = useCallback((event) => {
    resetSelection();
    setFilters((prev) => ({
      ...prev,
      category: event.target.value,
    }));
  }, [resetSelection]);

  const handleUrgencyChange = useCallback((event) => {
    resetSelection();
    setFilters((prev) => ({
      ...prev,
      urgencyLevel: event.target.value,
    }));
  }, [resetSelection]);

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
    <div className="h-[calc(100vh-88px)] overflow-hidden bg-[rgb(255,248,230)]">
      <div className="mx-auto flex h-full max-w-[1720px] flex-col px-3 py-3 sm:px-4 lg:px-5">
        <div className="relative z-[2500] shrink-0 overflow-visible">
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

        <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[350px_minmax(0,1fr)]">
          <div className="min-h-0">
            <NeedHelpMapSidebar
              visibleItems={sidebarItems}
              activeItemId={activeItemId}
              onItemSelect={handleItemSelect}
              isLoading={isLoading}
            />
          </div>

          <div className="relative z-0 min-h-0">
            <NeedHelpMapCanvas
              markers={markerResult.markers}
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

            {isFetching ? (
              <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur">
                Đang cập nhật bản đồ...
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}