import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, GeoJSON, Marker } from 'react-leaflet';
import { useLocationContext } from './LocationProvider';
import { useReverseGeocode, useBoundaryGeom } from './useLocationQueries';
import { MapPin, Hand, MousePointer2 } from 'lucide-react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

const VIETNAM_BOUNDS = [[8.18, 102.14], [23.39, 109.46]];

// Component Custom Icon (Không dùng ảnh png mặc định để tránh lỗi Vite Build)
const getCustomIcon = () => {
  const iconHtml = renderToString(<MapPin size={36} className="text-primary fill-primary/20 drop-shadow-md" strokeWidth={2} />);
  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-none', // Xóa nền trắng mặc định của Leaflet DivIcon
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Điểm neo chính xác ở mũi nhọn của icon
  });
};

// Giải quyết triệt để lỗi Màn hình xám bằng ResizeObserver
function MapLayoutFixer() {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

// Bắt sự kiện Click lên bản đồ để thả ghim (Chỉ chạy khi đang ở mode PICK)
function MapEventsObserver() {
  const mode = useLocationContext((state) => state.mode);
  const setCoordinates = useLocationContext((state) => state.setCoordinates);
  const clearBoundary = useLocationContext((state) => state.clearBoundary);

  useMapEvents({
    click(e) {
      if (mode === 'PICK') {
        setCoordinates([e.latlng.lng, e.latlng.lat], 'PICK');
        clearBoundary(); // Cắm ghim mới thì xóa cái viền tỉnh/thành đi
      }
    }
  });
  return null;
}

// Quản lý việc Auto Zoom (Bay)
function MapCenterController() {
  const coordinates = useLocationContext((state) => state.coordinates);
  const interactionType = useLocationContext((state) => state.interactionType);
  const map = useMap();
  
  useEffect(() => {
    // Chỉ ép bản đồ bay tới điểm đó nếu là do user Search hoặc Init ban đầu
    if (coordinates && (interactionType === 'SEARCH' || interactionType === 'INIT')) {
      map.flyTo([coordinates[1], coordinates[0]], 15, { animate: true, duration: 1.2 });
    }
  }, [coordinates, interactionType, map]);
  return null;
}

function FitBoundsController({ boundary }) {
  const map = useMap();
  useEffect(() => {
    if (boundary) {
      const geoJsonLayer = L.geoJSON(boundary);
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20], animate: true, duration: 1.5 });
    }
  }, [boundary, map]);
  return null;
}

export function MapDisplay({ hasError }) {
  const coordinates = useLocationContext((state) => state.coordinates);
  const interactionType = useLocationContext((state) => state.interactionType);
  const mode = useLocationContext((state) => state.mode);
  const setMode = useLocationContext((state) => state.setMode);
  const setCoordinates = useLocationContext((state) => state.setCoordinates);
  const setAddress = useLocationContext((state) => state.setAddress);
  const osmData = useLocationContext((state) => state.osmData);
  const clearBoundary = useLocationContext((state) => state.clearBoundary);

  const markerRef = useRef(null);
  const customMarkerIcon = useMemo(() => getCustomIcon(), []);

  const { data: fetchedAddress, isFetching } = useReverseGeocode(coordinates, interactionType);
  const { data: boundary, isFetching: isFetchingBoundary } = useBoundaryGeom(osmData);

  useEffect(() => {
    if (fetchedAddress) setAddress(fetchedAddress);
  }, [fetchedAddress, setAddress]);

  // Xử lý sự kiện nắm kéo cái Ghim
  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latlng = marker.getLatLng();
      setCoordinates([latlng.lng, latlng.lat], 'PICK');
      clearBoundary();
    }
  };

  return (
    <div className={`relative h-[350px] w-full rounded-xl overflow-hidden border z-0 transition-colors ${hasError ? 'border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'border-slate-200 shadow-inner'}`}>
      
      {/* TOOLBAR NỔI CHUẨN GOOGLE MAPS */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 bg-white rounded-lg shadow-md p-1">
        <button
          type="button"
          onClick={() => setMode('EXPLORE')}
          className={`p-2 rounded-md transition-colors flex items-center justify-center ${mode === 'EXPLORE' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          title="Chế độ xem (Di chuyển bản đồ)"
        >
          <Hand size={20} />
        </button>
        <button
          type="button"
          onClick={() => setMode('PICK')}
          className={`p-2 rounded-md transition-colors flex items-center justify-center ${mode === 'PICK' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          title="Chế độ chọn (Click để cắm ghim)"
        >
          <MousePointer2 size={20} />
        </button>
      </div>

      {(isFetching || isFetchingBoundary) && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Đang cập nhật vị trí...
        </div>
      )}

      <MapContainer 
        center={[coordinates[1], coordinates[0]]} 
        zoom={13}
        minZoom={5}
        maxBounds={VIETNAM_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true} 
        className={`h-full w-full ${mode === 'PICK' ? 'cursor-crosshair' : 'cursor-grab'}`}
        zoomControl={false} // Tắt zoom để gọn UI, nếu muốn cậu có thể bật lại (zoomControl={true})
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {boundary && osmData && (
          <GeoJSON 
            key={osmData.id} 
            data={boundary} 
            pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.1, dashArray: '5, 5' }} 
          />
        )}
        
        {/* CHỈ HIỂN THỊ GHIM KHI ĐÃ CÓ DATA CỤ THỂ HOẶC ĐANG Ở MODE PICK */}
        {(interactionType === 'PICK' || interactionType === 'INIT') && (
            <Marker 
                draggable={mode === 'PICK'} // Chỉ cho phép nắm kéo ghim khi ở mode PICK
                eventHandlers={{ dragend: handleMarkerDragEnd }}
                position={[coordinates[1], coordinates[0]]}
                ref={markerRef}
                icon={customMarkerIcon}
            />
        )}

        <FitBoundsController boundary={boundary} />
        <MapEventsObserver />
        <MapCenterController />
        <MapLayoutFixer />
      </MapContainer>

      {/* Helper message cho User */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-slate-800/80 text-white text-[11px] px-3 py-1.5 rounded-full pointer-events-none backdrop-blur-sm shadow-lg whitespace-nowrap">
        {mode === 'EXPLORE' ? 'Chế độ xem: Kéo thả để xem bản đồ' : 'Chế độ chọn: Click lên map để cắm ghim'}
      </div>
    </div>
  );
}