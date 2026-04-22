import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapView, {
  Source,
  Layer,
  Popup,
  Marker,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Link } from 'react-router-dom';
import { Layers3, MapPin, Navigation } from 'lucide-react';

import {
  NEED_HELP_CLUSTER_SWITCH_ZOOM,
  VIETNAM_DEFAULT_ZOOM,
  VIETNAM_MAP_BOUNDS,
  VIETNAM_MAP_CENTER,
  getUrgencyBadgeClass,
  getUrgencyLabel,
} from '../../utils/helpRequestMap.utils';

const BRAND_YELLOW = '#FBBF24';
const MAP_SOFT_YELLOW = '#FFF8E6';
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright';

const SOURCE_CLUSTERS = 'needhelp-clusters-source';
const SOURCE_ITEMS = 'needhelp-items-source';
const SOURCE_ACTIVE_CLUSTER = 'needhelp-active-cluster-source';
const SOURCE_ACTIVE_ITEM = 'needhelp-active-item-source';

const LAYER_CLUSTER_HALO = 'needhelp-cluster-halo';
const LAYER_CLUSTER_CORE = 'needhelp-cluster-core';
const LAYER_CLUSTER_LABEL = 'needhelp-cluster-label';

const LAYER_ITEM_HALO = 'needhelp-item-halo';
const LAYER_ITEM_CORE = 'needhelp-item-core';
const LAYER_ITEM_LABEL = 'needhelp-item-label';

const LAYER_ACTIVE_CLUSTER_HALO = 'needhelp-active-cluster-halo';
const LAYER_ACTIVE_CLUSTER_CORE = 'needhelp-active-cluster-core';
const LAYER_ACTIVE_CLUSTER_LABEL = 'needhelp-active-cluster-label';

const LAYER_ACTIVE_ITEM_HALO = 'needhelp-active-item-halo';
const LAYER_ACTIVE_ITEM_CORE = 'needhelp-active-item-core';
const LAYER_ACTIVE_ITEM_LABEL = 'needhelp-active-item-label';

const INTERACTIVE_LAYER_IDS = [
  LAYER_CLUSTER_CORE,
  LAYER_CLUSTER_LABEL,
  LAYER_ACTIVE_CLUSTER_CORE,
  LAYER_ACTIVE_CLUSTER_LABEL,
  LAYER_ITEM_CORE,
  LAYER_ITEM_LABEL,
  LAYER_ACTIVE_ITEM_CORE,
  LAYER_ACTIVE_ITEM_LABEL,
];

function formatMoney(value) {
  const amount = Number(value || 0);
  if (!amount) return 'Chưa cập nhật';
  return `${amount.toLocaleString('vi-VN')} đ`;
}

function formatCoordinate(value) {
  return Number.isFinite(value) ? Number(value).toFixed(5) : '--';
}

function getLng(item) {
  if (Number.isFinite(item?.longitude)) return item.longitude;

  if (Array.isArray(item?.coordinates) && Number.isFinite(item.coordinates[0])) {
    return item.coordinates[0];
  }

  if (
    item?.location &&
    Array.isArray(item.location.coordinates) &&
    Number.isFinite(item.location.coordinates[0])
  ) {
    return item.location.coordinates[0];
  }

  return null;
}

function getLat(item) {
  if (Number.isFinite(item?.latitude)) return item.latitude;

  if (Array.isArray(item?.coordinates) && Number.isFinite(item.coordinates[1])) {
    return item.coordinates[1];
  }

  if (
    item?.location &&
    Array.isArray(item.location.coordinates) &&
    Number.isFinite(item.location.coordinates[1])
  ) {
    return item.location.coordinates[1];
  }

  return null;
}

function hideSensitiveSeaLabels(map) {
  const sensitiveSeaMask = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [108.5, 8.0],
        [122.8, 8.0],
        [122.8, 20.5],
        [108.5, 20.5],
        [108.5, 8.0],
      ]],
    },
  };

  const style = map.getStyle?.();
  const layers = style?.layers || [];

  layers.forEach((layer) => {
    if (!layer?.id || layer.type !== 'symbol') return;

    const id = String(layer.id).toLowerCase();
    const sourceLayer = String(layer['source-layer'] || '').toLowerCase();

    const isSensitiveTextLayer =
      id.includes('place') ||
      id.includes('label') ||
      id.includes('name') ||
      id.includes('marine') ||
      id.includes('water') ||
      id.includes('ocean') ||
      id.includes('sea') ||
      id.includes('island') ||
      sourceLayer.includes('place') ||
      sourceLayer.includes('name') ||
      sourceLayer.includes('marine') ||
      sourceLayer.includes('water') ||
      sourceLayer.includes('ocean') ||
      sourceLayer.includes('sea') ||
      sourceLayer.includes('island');

    if (!isSensitiveTextLayer) return;

    try {
      const currentFilter = map.getFilter(layer.id);

      if (currentFilter) {
        map.setFilter(layer.id, [
          'all',
          currentFilter,
          ['!', ['within', sensitiveSeaMask]],
        ]);
      } else {
        map.setFilter(layer.id, ['!', ['within', sensitiveSeaMask]]);
      }
    } catch {}
  });
}

const NeedHelpPopupContent = memo(function NeedHelpPopupContent({ item }) {
  return (
    <div className="w-[min(320px,calc(100vw-48px))] max-w-full min-w-0">
      <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2 pr-6">
        <span
          className={`inline-flex max-w-full rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${getUrgencyBadgeClass(
            item.urgencyLevel
          )}`}
        >
          {getUrgencyLabel(item.urgencyLevel)}
        </span>

        {item.category ? (
          <span className="inline-flex max-w-full rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
            <span className="truncate">
              {item.categoryLabel || item.category}
            </span>
          </span>
        ) : null}
      </div>

      <h3 className="min-w-0 break-words text-[18px] font-bold leading-7 text-slate-900 line-clamp-2">
        {item.title || 'Yêu cầu trợ giúp'}
      </h3>

      <div className="mt-3 flex min-w-0 items-start gap-2 text-sm text-slate-500">
        <MapPin size={15} className="mt-0.5 shrink-0" />
        <span className="min-w-0 break-words leading-6 line-clamp-2">
          {item.address || 'Chưa có địa chỉ'}
        </span>
      </div>

      <p className="mt-3 min-w-0 break-all text-sm leading-6 text-slate-500 line-clamp-2">
        {item.story || 'Yêu cầu trợ giúp này đang chờ được xem xét và hỗ trợ.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-[18px] bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold text-slate-500">Kinh độ</div>
          <div className="mt-1 break-all text-[16px] font-bold text-slate-900">
            {formatCoordinate(item.longitude)}
          </div>
        </div>

        <div className="min-w-0 rounded-[18px] bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold text-slate-500">Vĩ độ</div>
          <div className="mt-1 break-all text-[16px] font-bold text-slate-900">
            {formatCoordinate(item.latitude)}
          </div>
        </div>
      </div>

      <div className="mt-3 min-w-0 rounded-[18px] bg-slate-50 px-3 py-3">
        <div className="text-[11px] font-semibold text-slate-500">
          Mức hỗ trợ cần thiết
        </div>
        <div className="mt-1 break-words text-[16px] font-bold text-slate-900">
          {formatMoney(item.amountNeeded)}
        </div>
      </div>

      <Link
        to={`/need-help/${item.id}`}
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-base font-bold text-slate-900 transition hover:brightness-95"
        style={{ backgroundColor: BRAND_YELLOW }}
      >
        Xem chi tiết
      </Link>
    </div>
  );
});

const ClusterPopupContent = memo(function ClusterPopupContent({ item }) {
  return (
    <div className="w-[min(280px,calc(100vw-48px))] max-w-full min-w-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Layers3 size={18} />
        </div>

        <div className="min-w-0">
          <div className="break-words text-sm font-bold text-slate-900">
            {item.count} yêu cầu trong khu vực này
          </div>
          <div className="mt-1 text-xs leading-5 text-slate-500">
            Bấm vào cụm để phóng to và xem chi tiết hơn
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-[18px] bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold text-slate-500">Kinh độ</div>
          <div className="mt-1 break-all text-sm font-bold text-slate-900">
            {formatCoordinate(item.longitude)}
          </div>
        </div>

        <div className="min-w-0 rounded-[18px] bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold text-slate-500">Vĩ độ</div>
          <div className="mt-1 break-all text-sm font-bold text-slate-900">
            {formatCoordinate(item.latitude)}
          </div>
        </div>
      </div>
    </div>
  );
});

function buildFeatureCollection(features) {
  return {
    type: 'FeatureCollection',
    features,
  };
}

function makeClusterFeature(item) {
  return {
    type: 'Feature',
    id: item.clusterId,
    geometry: {
      type: 'Point',
      coordinates: [item.longitude, item.latitude],
    },
    properties: {
      kind: 'cluster',
      clusterId: item.clusterId,
      rawClusterId: item.rawClusterId ?? '',
      count: Number(item.count || 0),
      expandZoom: Number(item.expandZoom || 11),
      longitude: item.longitude,
      latitude: item.latitude,
    },
  };
}

function makeItemFeature(item) {
  return {
    type: 'Feature',
    id: item.id,
    geometry: {
      type: 'Point',
      coordinates: [item.longitude, item.latitude],
    },
    properties: {
      kind: 'item',
      id: item.id,
      title: item.title || '',
      story: item.story || '',
      urgencyLevel: item.urgencyLevel || '',
      category: item.category || '',
      categoryLabel: item.categoryLabel || '',
      address: item.address || '',
      amountNeeded: Number(item.amountNeeded || 0),
      longitude: item.longitude,
      latitude: item.latitude,
    },
  };
}

const clusterHaloLayer = {
  id: LAYER_CLUSTER_HALO,
  type: 'circle',
  source: SOURCE_CLUSTERS,
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'count'],
      1, 28,
      5, 32,
      20, 38,
      100, 46,
    ],
    'circle-color': 'rgba(251,191,36,0.14)',
  },
};

const clusterCoreLayer = {
  id: LAYER_CLUSTER_CORE,
  type: 'circle',
  source: SOURCE_CLUSTERS,
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'count'],
      1, 18,
      5, 21,
      20, 24,
      100, 28,
    ],
    'circle-color': '#FBBF24',
    'circle-stroke-width': 5,
    'circle-stroke-color': '#ffffff',
  },
};

const clusterLabelLayer = {
  id: LAYER_CLUSTER_LABEL,
  type: 'symbol',
  source: SOURCE_CLUSTERS,
  layout: {
    'text-field': ['to-string', ['get', 'count']],
    'text-size': [
      'interpolate',
      ['linear'],
      ['get', 'count'],
      1, 12,
      5, 14,
      20, 16,
      100, 18,
    ],
    'text-font': ['Open Sans Bold'],
    'text-allow-overlap': true,
  },
  paint: {
    'text-color': '#111827',
  },
};

const itemHaloLayer = {
  id: LAYER_ITEM_HALO,
  type: 'circle',
  source: SOURCE_ITEMS,
  paint: {
    'circle-radius': 22,
    'circle-color': 'rgba(251,191,36,0.14)',
  },
};

const itemCoreLayer = {
  id: LAYER_ITEM_CORE,
  type: 'circle',
  source: SOURCE_ITEMS,
  paint: {
    'circle-radius': 14,
    'circle-color': '#FBBF24',
    'circle-stroke-width': 4,
    'circle-stroke-color': '#ffffff',
  },
};

const itemLabelLayer = {
  id: LAYER_ITEM_LABEL,
  type: 'symbol',
  source: SOURCE_ITEMS,
  layout: {
    'text-field': '1',
    'text-size': 11,
    'text-font': ['Open Sans Bold'],
    'text-allow-overlap': true,
  },
  paint: {
    'text-color': '#111827',
  },
};

const activeClusterHaloLayer = {
  id: LAYER_ACTIVE_CLUSTER_HALO,
  type: 'circle',
  source: SOURCE_ACTIVE_CLUSTER,
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'count'],
      1, 34,
      5, 38,
      20, 44,
      100, 52,
    ],
    'circle-color': 'rgba(251,191,36,0.22)',
  },
};

const activeClusterCoreLayer = {
  id: LAYER_ACTIVE_CLUSTER_CORE,
  type: 'circle',
  source: SOURCE_ACTIVE_CLUSTER,
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'count'],
      1, 20,
      5, 23,
      20, 26,
      100, 31,
    ],
    'circle-color': '#FBBF24',
    'circle-stroke-width': 5,
    'circle-stroke-color': '#111827',
  },
};

const activeClusterLabelLayer = {
  id: LAYER_ACTIVE_CLUSTER_LABEL,
  type: 'symbol',
  source: SOURCE_ACTIVE_CLUSTER,
  layout: {
    'text-field': ['to-string', ['get', 'count']],
    'text-size': [
      'interpolate',
      ['linear'],
      ['get', 'count'],
      1, 12,
      5, 14,
      20, 16,
      100, 18,
    ],
    'text-font': ['Open Sans Bold'],
    'text-allow-overlap': true,
  },
  paint: {
    'text-color': '#111827',
  },
};

const activeItemHaloLayer = {
  id: LAYER_ACTIVE_ITEM_HALO,
  type: 'circle',
  source: SOURCE_ACTIVE_ITEM,
  paint: {
    'circle-radius': 28,
    'circle-color': 'rgba(251,191,36,0.22)',
  },
};

const activeItemCoreLayer = {
  id: LAYER_ACTIVE_ITEM_CORE,
  type: 'circle',
  source: SOURCE_ACTIVE_ITEM,
  paint: {
    'circle-radius': 16,
    'circle-color': '#FBBF24',
    'circle-stroke-width': 4,
    'circle-stroke-color': '#111827',
  },
};

const activeItemLabelLayer = {
  id: LAYER_ACTIVE_ITEM_LABEL,
  type: 'symbol',
  source: SOURCE_ACTIVE_ITEM,
  layout: {
    'text-field': '1',
    'text-size': 11,
    'text-font': ['Open Sans Bold'],
    'text-allow-overlap': true,
  },
  paint: {
    'text-color': '#111827',
  },
};

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
  const mapRef = useRef(null);
  const lastLocateRequestId = useRef(0);
  const lastResetRequestId = useRef(0);
  const lastItemId = useRef('');
  const lastClusterId = useRef('');
  const lastViewportRef = useRef('');
  const viewportTimeoutRef = useRef(null);
  const labelsHiddenRef = useRef(false);

  const [popupItem, setPopupItem] = useState(null);
  const [popupCluster, setPopupCluster] = useState(null);
  const [baseReady, setBaseReady] = useState(false);

  const safeMarkers = useMemo(
    () => (Array.isArray(markers) ? markers : []),
    [markers]
  );

  const initialViewState = useMemo(
    () => ({
      longitude: VIETNAM_MAP_CENTER[1],
      latitude: VIETNAM_MAP_CENTER[0],
      zoom: VIETNAM_DEFAULT_ZOOM,
    }),
    []
  );

  const normalizedBounds = useMemo(
    () => [
      [VIETNAM_MAP_BOUNDS[0][1], VIETNAM_MAP_BOUNDS[0][0]],
      [VIETNAM_MAP_BOUNDS[1][1], VIETNAM_MAP_BOUNDS[1][0]],
    ],
    []
  );

  const visibleMarkers = useMemo(
    () =>
      safeMarkers
        .map((item) => {
          const longitude = getLng(item);
          const latitude = getLat(item);

          return {
            ...item,
            longitude,
            latitude,
          };
        })
        .filter(
          (item) =>
            Number.isFinite(item.longitude) && Number.isFinite(item.latitude)
        ),
    [safeMarkers]
  );

  const itemMap = useMemo(() => {
    const map = new globalThis.Map();
    visibleMarkers.forEach((item) => {
      if (item.type !== 'cluster' && item.id) {
        map.set(String(item.id), item);
      }
    });
    return map;
  }, [visibleMarkers]);

  const clusterMap = useMemo(() => {
    const map = new globalThis.Map();
    visibleMarkers.forEach((item) => {
      if (item.type === 'cluster' && item.clusterId) {
        map.set(String(item.clusterId), item);
      }
    });
    return map;
  }, [visibleMarkers]);

  const inactiveClusterFeatures = useMemo(
    () =>
      visibleMarkers
        .filter(
          (item) =>
            item.type === 'cluster' &&
            String(item.clusterId) !== String(activeClusterId || '')
        )
        .map(makeClusterFeature),
    [visibleMarkers, activeClusterId]
  );

  const activeClusterFeatures = useMemo(
    () =>
      visibleMarkers
        .filter(
          (item) =>
            item.type === 'cluster' &&
            String(item.clusterId) === String(activeClusterId || '')
        )
        .map(makeClusterFeature),
    [visibleMarkers, activeClusterId]
  );

  const inactiveItemFeatures = useMemo(
    () =>
      visibleMarkers
        .filter(
          (item) =>
            item.type !== 'cluster' && String(item.id) !== String(activeItemId || '')
        )
        .map(makeItemFeature),
    [visibleMarkers, activeItemId]
  );

  const activeItemFeatures = useMemo(
    () =>
      visibleMarkers
        .filter(
          (item) =>
            item.type !== 'cluster' && String(item.id) === String(activeItemId || '')
        )
        .map(makeItemFeature),
    [visibleMarkers, activeItemId]
  );

  const clusterGeoJson = useMemo(
    () => buildFeatureCollection(inactiveClusterFeatures),
    [inactiveClusterFeatures]
  );

  const activeClusterGeoJson = useMemo(
    () => buildFeatureCollection(activeClusterFeatures),
    [activeClusterFeatures]
  );

  const itemGeoJson = useMemo(
    () => buildFeatureCollection(inactiveItemFeatures),
    [inactiveItemFeatures]
  );

  const activeItemGeoJson = useMemo(
    () => buildFeatureCollection(activeItemFeatures),
    [activeItemFeatures]
  );

  useEffect(() => {
    if (!selectedItem?.id) return;
    if (lastItemId.current === selectedItem.id) return;

    const map = mapRef.current?.getMap?.();
    const lng = getLng(selectedItem);
    const lat = getLat(selectedItem);

    if (!map || !Number.isFinite(lng) || !Number.isFinite(lat)) return;

    lastItemId.current = selectedItem.id;
    setPopupCluster(null);

    map.flyTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), NEED_HELP_CLUSTER_SWITCH_ZOOM + 1),
      duration: 450,
      essential: true,
    });

    setPopupItem({
      ...selectedItem,
      longitude: lng,
      latitude: lat,
    });
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedCluster?.clusterId) return;
    if (lastClusterId.current === selectedCluster.clusterId) return;

    const map = mapRef.current?.getMap?.();
    const lng = getLng(selectedCluster);
    const lat = getLat(selectedCluster);

    if (!map || !Number.isFinite(lng) || !Number.isFinite(lat)) return;

    lastClusterId.current = selectedCluster.clusterId;
    setPopupItem(null);

    map.flyTo({
      center: [lng, lat],
      zoom: selectedCluster.expandZoom || Math.max(map.getZoom() + 2, 10),
      duration: 430,
      essential: true,
    });

    setPopupCluster({
      ...selectedCluster,
      longitude: lng,
      latitude: lat,
    });
  }, [selectedCluster]);

  useEffect(() => {
    if (!locateRequestId || lastLocateRequestId.current === locateRequestId) {
      return;
    }

    lastLocateRequestId.current = locateRequestId;

    const map = mapRef.current?.getMap?.();
    const lng = getLng(userLocation);
    const lat = getLat(userLocation);

    if (!map || !Number.isFinite(lng) || !Number.isFinite(lat)) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 13,
      duration: 480,
      essential: true,
    });
  }, [locateRequestId, userLocation]);

  useEffect(() => {
    if (!resetRequestId || lastResetRequestId.current === resetRequestId) {
      return;
    }

    lastResetRequestId.current = resetRequestId;

    const map = mapRef.current?.getMap?.();
    if (!map) return;

    setPopupItem(null);
    setPopupCluster(null);

    map.fitBounds(normalizedBounds, {
      padding: 32,
      duration: 500,
      essential: true,
    });
  }, [normalizedBounds, resetRequestId]);

  useEffect(() => {
    return () => {
      if (viewportTimeoutRef.current) {
        clearTimeout(viewportTimeoutRef.current);
      }
    };
  }, []);

  const emitViewportChange = useCallback(
    (map) => {
      const bounds = map.getBounds();

      const nextViewport = {
        north: Number(bounds.getNorth().toFixed(5)),
        south: Number(bounds.getSouth().toFixed(5)),
        east: Number(bounds.getEast().toFixed(5)),
        west: Number(bounds.getWest().toFixed(5)),
        zoom: Number(map.getZoom().toFixed(2)),
      };

      const signature = JSON.stringify(nextViewport);
      if (lastViewportRef.current === signature) return;

      lastViewportRef.current = signature;
      onViewportChange?.(nextViewport);
    },
    [onViewportChange]
  );

  const handleViewportChange = useCallback(
    (event) => {
      const map = event.target;

      if (viewportTimeoutRef.current) {
        clearTimeout(viewportTimeoutRef.current);
      }

      viewportTimeoutRef.current = setTimeout(() => {
        emitViewportChange(map);
      }, 60);
    },
    [emitViewportChange]
  );

  const tryHideLabels = useCallback((map) => {
    if (labelsHiddenRef.current) return;
    hideSensitiveSeaLabels(map);
    labelsHiddenRef.current = true;
  }, []);

  const handleMapLoad = useCallback(
    (event) => {
      const map = event.target;
      tryHideLabels(map);
      setBaseReady(true);
      emitViewportChange(map);
    },
    [emitViewportChange, tryHideLabels]
  );

  const handleStyleData = useCallback(() => {
    const map = mapRef.current?.getMap?.();
    if (!map) return;
    tryHideLabels(map);
  }, [tryHideLabels]);

  const handleMapClick = useCallback(
    (event) => {
      const feature = event.features?.[0];

      if (!feature) {
        setPopupItem(null);
        setPopupCluster(null);
        return;
      }

      const layerId = feature.layer?.id || '';
      const props = feature.properties || {};

      if (layerId.includes('cluster')) {
        const clusterId = String(props.clusterId || '');
        const cluster = clusterMap.get(clusterId);

        if (cluster) {
          setPopupItem(null);
          setPopupCluster(cluster);
          onClusterSelect?.(cluster);
          return;
        }
      }

      if (layerId.includes('item')) {
        const id = String(props.id || '');
        const item = itemMap.get(id);

        if (item) {
          setPopupCluster(null);
          setPopupItem(item);
          onItemSelect?.(item);
          return;
        }
      }

      setPopupItem(null);
      setPopupCluster(null);
    },
    [clusterMap, itemMap, onClusterSelect, onItemSelect]
  );

  return (
    <>
      <style>{`
        .needhelp-maplibre,
        .needhelp-maplibre .maplibregl-map,
        .needhelp-maplibre .maplibregl-canvas-container,
        .needhelp-maplibre .maplibregl-canvas {
          width: 100%;
          height: 100%;
        }

        .needhelp-maplibre .maplibregl-map {
          background: ${MAP_SOFT_YELLOW};
        }

        .needhelp-maplibre .maplibregl-canvas {
          outline: none;
        }

        .needhelp-maplibre .maplibregl-ctrl-group {
          border-radius: 18px !important;
          overflow: hidden;
          border: 1px solid #fde68a !important;
          box-shadow: 0 10px 22px rgba(15,23,42,0.10) !important;
        }

        .needhelp-maplibre .maplibregl-ctrl-group button {
          background: #ffffff !important;
        }

        .needhelp-maplibre .maplibregl-ctrl-group button:hover {
          background: #fef3c7 !important;
        }

        .needhelp-maplibre .maplibregl-ctrl-scale {
          border-radius: 999px !important;
          border: 1px solid #fde68a !important;
          background: rgba(255,255,255,0.96) !important;
          color: #0f172a !important;
          padding: 2px 10px !important;
          box-shadow: 0 8px 16px rgba(15,23,42,0.08) !important;
        }

        .needhelp-maplibre .maplibregl-popup {
          max-width: none !important;
        }

        .needhelp-maplibre .maplibregl-popup-content {
          padding: 16px !important;
          border-radius: 22px !important;
          box-shadow: 0 16px 34px rgba(15,23,42,0.16) !important;
        }

        .needhelp-maplibre .maplibregl-popup-tip {
          border-top-color: white !important;
        }

        .needhelp-maplibre .maplibregl-popup-close-button {
          font-size: 20px;
          line-height: 1;
          color: #475569;
          padding: 8px 10px;
          right: 2px;
          top: 2px;
        }
      `}</style>

      <div className="needhelp-maplibre absolute inset-0">
        <MapView
          ref={mapRef}
          initialViewState={initialViewState}
          mapStyle={MAP_STYLE_URL}
          minZoom={5}
          maxZoom={18}
          dragRotate={false}
          pitchWithRotate={false}
          touchZoomRotate={false}
          attributionControl={false}
          interactiveLayerIds={INTERACTIVE_LAYER_IDS}
          style={{ width: '100%', height: '100%' }}
          onLoad={handleMapLoad}
          onStyleData={handleStyleData}
          onMoveEnd={handleViewportChange}
          onZoomEnd={handleViewportChange}
          onClick={handleMapClick}
        >
          <NavigationControl position="bottom-right" />
          <GeolocateControl
            position="bottom-right"
            trackUserLocation
            showUserHeading
          />
          <FullscreenControl position="bottom-right" />
          <ScaleControl position="bottom-left" unit="metric" />

          {baseReady ? (
            <>
              <Source id={SOURCE_CLUSTERS} type="geojson" data={clusterGeoJson}>
                <Layer {...clusterHaloLayer} />
                <Layer {...clusterCoreLayer} />
                <Layer {...clusterLabelLayer} />
              </Source>

              <Source
                id={SOURCE_ACTIVE_CLUSTER}
                type="geojson"
                data={activeClusterGeoJson}
              >
                <Layer {...activeClusterHaloLayer} />
                <Layer {...activeClusterCoreLayer} />
                <Layer {...activeClusterLabelLayer} />
              </Source>

              <Source id={SOURCE_ITEMS} type="geojson" data={itemGeoJson}>
                <Layer {...itemHaloLayer} />
                <Layer {...itemCoreLayer} />
                <Layer {...itemLabelLayer} />
              </Source>

              <Source
                id={SOURCE_ACTIVE_ITEM}
                type="geojson"
                data={activeItemGeoJson}
              >
                <Layer {...activeItemHaloLayer} />
                <Layer {...activeItemCoreLayer} />
                <Layer {...activeItemLabelLayer} />
              </Source>
            </>
          ) : null}

          {popupItem ? (
            <Popup
              longitude={popupItem.longitude}
              latitude={popupItem.latitude}
              anchor="top"
              offset={18}
              closeOnClick={false}
              onClose={() => setPopupItem(null)}
            >
              <NeedHelpPopupContent item={popupItem} />
            </Popup>
          ) : null}

          {popupCluster ? (
            <Popup
              longitude={popupCluster.longitude}
              latitude={popupCluster.latitude}
              anchor="top"
              offset={18}
              closeOnClick={false}
              onClose={() => setPopupCluster(null)}
            >
              <ClusterPopupContent item={popupCluster} />
            </Popup>
          ) : null}

          {Number.isFinite(getLng(userLocation)) && Number.isFinite(getLat(userLocation)) ? (
            <>
              <Marker
                longitude={getLng(userLocation)}
                latitude={getLat(userLocation)}
                anchor="center"
              >
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <div className="absolute h-10 w-10 rounded-full bg-sky-500/20 animate-pulse" />
                  <div className="absolute h-5 w-5 rounded-full border-4 border-white bg-sky-500 shadow-lg" />
                </div>
              </Marker>

              <Popup
                longitude={getLng(userLocation)}
                latitude={getLat(userLocation)}
                anchor="top"
                offset={16}
                closeButton={false}
                closeOnClick={false}
              >
                <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-sky-500" />
                  <span className="text-sm font-semibold text-slate-900">
                    Vị trí hiện tại của bạn
                  </span>
                </div>
              </Popup>
            </>
          ) : null}
        </MapView>
      </div>
    </>
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