import { useState, useRef, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import axios from "axios";
import { Search, MapPin, Loader2, MapPinned } from "lucide-react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, map]);

  return null;
}

function MapEvents({ setPosition, fetchAddressByCoords }) {
  useMapEvents({
    dragend(e) {
      const { lat, lng } = e.target.getCenter();
      setPosition({ lat, lng });
      fetchAddressByCoords(lat, lng);
    },
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      fetchAddressByCoords(lat, lng);
    },
  });

  return null;
}

export function LocationPicker({ value, onChange, hasError }) {
  const defaultCenter = { lat: 10.7769, lng: 106.7009 };
  const [position, setPosition] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (value?.coordinates?.length === 2) {
      setPosition({ lat: value.coordinates[1], lng: value.coordinates[0] });
      setAddress(value.address || "");
      return;
    }

    if (!value) {
      setAddress("");
    }
  }, [value]);

  const fetchAddressByCoords = useCallback(
    async (lat, lng) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { signal: abortControllerRef.current.signal }
        );

        const foundAddress = res.data.display_name;
        setAddress(foundAddress);
        setShowDropdown(false);
        setSuggestions([]);

        onChange({
          type: "Point",
          coordinates: [lng, lat],
          address: foundAddress,
        });
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("[CTO Log] Reverse Geocoding Error:", error);
        }
      }
    },
    [onChange]
  );

  const handleInputChange = (e) => {
    const text = e.target.value;
    setAddress(text);
    onChange(null);

    if (text.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    searchTimeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text
          )}&limit=5&countrycodes=vn`,
          { signal: abortControllerRef.current.signal }
        );

        setSuggestions(res.data || []);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("[CTO Log] Search Address Error:", error);
        }
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSuggestion = (item) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);

    setPosition({ lat: newLat, lng: newLng });
    setAddress(item.display_name);
    setShowDropdown(false);
    setSuggestions([]);

    onChange({
      type: "Point",
      coordinates: [newLng, newLat],
      address: item.display_name,
    });
  };

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder="Nhập địa điểm (Gợi ý tự động)..."
          className={`w-full rounded-xl border py-3 pl-10 pr-10 shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary ${
            hasError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white"
          }`}
          autoComplete="off"
        />
        <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />

        {isSearching && (
          <div className="absolute right-3 top-3.5 text-primary">
            <Loader2 className="animate-spin" size={20} />
          </div>
        )}

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-lg">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(item)}
                className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <MapPinned
                  className="mt-0.5 shrink-0 text-slate-400"
                  size={18}
                />
                <span className="line-clamp-2 text-sm text-slate-700">
                  {item.display_name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className={`relative z-0 h-[300px] overflow-hidden rounded-xl border ${
          hasError
            ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
            : "border-slate-200 shadow-inner"
        }`}
      >
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker draggable position={position} />
          <MapEvents
            setPosition={setPosition}
            fetchAddressByCoords={fetchAddressByCoords}
          />
          <MapUpdater center={position} />
        </MapContainer>
      </div>

      <p className="flex items-center gap-1.5 pl-1 text-xs font-medium text-slate-500">
        <MapPin size={14} className="text-primary" />
        Kéo thả ghim trên bản đồ để tinh chỉnh vị trí chính xác.
      </p>
    </div>
  );
}

export default LocationPicker;