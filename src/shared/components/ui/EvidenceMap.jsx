import React, { useEffect, useMemo } from 'react';
import { renderToString } from 'react-dom/server';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const customMarkerIcon = L.divIcon({
  html: renderToString(
    <MapPin size={28} className="text-red-500 fill-white" />
  ),
  className: 'bg-transparent border-none',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MapBoundsSetter({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [points, map]);

  return null;
}

export function EvidenceMap({ markers = [] }) {
  const validPoints = useMemo(
    () =>
      markers
        .filter(
          (m) =>
            Array.isArray(m.captureMetadata?.location?.coordinates) &&
            m.captureMetadata.location.coordinates.length >= 2
        )
        .map((m) => ({
          id: m.id || m._id,
          lat: Number(m.captureMetadata.location.coordinates[1]),
          lng: Number(m.captureMetadata.location.coordinates[0]),
          url: m.url,
        }))
        .filter(
          (point) =>
            Number.isFinite(point.lat) && Number.isFinite(point.lng)
        ),
    [markers]
  );

  if (validPoints.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4 text-center text-xs text-slate-400">
        Không tìm thấy dữ liệu GPS trong các ảnh được cung cấp.
      </div>
    );
  }

  return (
    <div className="z-0 h-full w-full overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={[validPoints[0].lat, validPoints[0].lng]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {validPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={customMarkerIcon}
          >
            <Popup>
              <img
                src={point.url}
                alt="Bằng chứng"
                className="h-20 w-32 rounded-lg object-cover"
              />
            </Popup>
          </Marker>
        ))}
        <MapBoundsSetter points={validPoints} />
      </MapContainer>
    </div>
  );
}