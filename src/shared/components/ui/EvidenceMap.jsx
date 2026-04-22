import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { MapPin } from 'lucide-react';

const customMarkerIcon = L.divIcon({
    html: renderToString(<MapPin size={28} className="text-red-500 fill-white" />),
    className: 'bg-transparent border-none',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
});

function MapBoundsSetter({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
        }
    }, [points, map]);
    return null;
}

export function EvidenceMap({ markers = [] }) {
    // [FIXED]: Xử lý tương thích ngược & tương thích chéo cho cả object flat và GeoJSON
    const validPoints = useMemo(() => markers
        .map(m => {
            const meta = m.captureMetadata || {};
            let lat = null;
            let lng = null;

            // Xử lý chuẩn Data phẳng (BE đang trả về hiện tại)
            if (typeof meta.lat === 'number' && typeof meta.lng === 'number') {
                lat = meta.lat;
                lng = meta.lng;
            } 
            // Dự phòng hỗ trợ GeoJSON (nếu BE nâng cấp)
            else if (Array.isArray(meta.location?.coordinates) && meta.location.coordinates.length >= 2) {
                lat = meta.location.coordinates[1];
                lng = meta.location.coordinates[0];
            }

            return {
                id: m.id || m._id,
                lat,
                lng,
                url: m.url
            };
        })
        .filter(point => point.lat !== null && point.lng !== null), [markers]);

    if (validPoints.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 text-xs text-center p-4">
                Không tìm thấy dữ liệu GPS trong các ảnh được cung cấp.
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden border border-slate-200 z-0">
            <MapContainer center={[validPoints[0].lat, validPoints[0].lng]} zoom={13} className="h-full w-full relative z-0">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {validPoints.map((point) => (
                    <Marker 
                        key={point.id} 
                        position={[point.lat, point.lng]} 
                        icon={customMarkerIcon}
                    >
                        <Popup>
                            <img src={point.url} alt="Bằng chứng" className="w-32 h-20 object-cover rounded-lg" />
                        </Popup>
                    </Marker>
                ))}
                <MapBoundsSetter points={validPoints} />
            </MapContainer>
        </div>
    );
}