import {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import axios from "axios";
import { Search, MapPin, Loader2, MapPinned, X } from "lucide-react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };
const DEFAULT_ZOOM = 15;
const SEARCH_DELAY = 350;
const REVERSE_DELAY = 300;
const MAP_MOUNT_DELAY = 120;
const MAP_HEIGHT_CLASS = "h-[220px] xl:h-[230px]";

function areSameCoords(a, b) {
  if (!a || !b) return false;
  return Math.abs(a.lat - b.lat) < 0.000001 && Math.abs(a.lng - b.lng) < 0.000001;
}

function MapUpdater({ center, zoom = DEFAULT_ZOOM }) {
  const map = useMap();
  const lastViewRef = useRef("");

  useEffect(() => {
    if (!center?.lat || !center?.lng) return;

    const nextKey = `${center.lat.toFixed(6)}:${center.lng.toFixed(6)}:${zoom}`;
    if (lastViewRef.current === nextKey) return;

    lastViewRef.current = nextKey;
    map.setView([center.lat, center.lng], zoom, {
      animate: false,
    });
  }, [center, zoom, map]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      map.invalidateSize(false);
    });

    return () => cancelAnimationFrame(id);
  }, [map]);

  return null;
}

const MapEvents = memo(function MapEvents({ onMapClick }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onMapClick(lat, lng);
    },
  });

  return null;
});

function MapSkeleton({ hasError }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        hasError
          ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.16)]"
          : "border-slate-200"
      }`}
    >
      <div
        className={`w-full ${MAP_HEIGHT_CLASS} animate-pulse bg-[linear-gradient(110deg,#f8fafc,35%,#eef2f7,50%,#f8fafc,65%)] bg-[length:200%_100%]`}
      />
    </div>
  );
}

function LocationPickerComponent({ value, onChange, hasError }) {
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  const wrapperRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const reverseTimeoutRef = useRef(null);
  const searchAbortRef = useRef(null);
  const reverseAbortRef = useRef(null);
  const initializedFromValueRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRenderMap(true);
    }, MAP_MOUNT_DELAY);

    return () => clearTimeout(timer);
  }, []);

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
      if (reverseTimeoutRef.current) clearTimeout(reverseTimeoutRef.current);

      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (reverseAbortRef.current) reverseAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (value?.coordinates?.length === 2) {
      const nextLat = value.coordinates[1];
      const nextLng = value.coordinates[0];
      const nextAddress = value.address || "";

      setPosition((prev) => {
        const next = { lat: nextLat, lng: nextLng };
        return areSameCoords(prev, next) ? prev : next;
      });

      setAddress((prev) => (prev === nextAddress ? prev : nextAddress));
      initializedFromValueRef.current = true;
      return;
    }

    if (!value && initializedFromValueRef.current) {
      setAddress("");
    }
  }, [value]);

  const emitChange = useCallback(
    (lat, lng, foundAddress) => {
      onChange({
        type: "Point",
        coordinates: [lng, lat],
        address: foundAddress,
      });
    },
    [onChange]
  );

  const resolveAddressByCoords = useCallback(
    (lat, lng) => {
      if (reverseTimeoutRef.current) clearTimeout(reverseTimeoutRef.current);
      if (reverseAbortRef.current) reverseAbortRef.current.abort();

      setIsResolvingAddress(true);

      reverseTimeoutRef.current = setTimeout(async () => {
        reverseAbortRef.current = new AbortController();

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              signal: reverseAbortRef.current.signal,
              headers: {
                Accept: "application/json",
              },
            }
          );

          const foundAddress = response.data?.display_name || "";
          setAddress(foundAddress);
          setSuggestions([]);
          setShowDropdown(false);
          emitChange(lat, lng, foundAddress);
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error("[LocationPicker] Reverse geocoding error:", error);
          }
        } finally {
          setIsResolvingAddress(false);
        }
      }, REVERSE_DELAY);
    },
    [emitChange]
  );

  const handlePositionChange = useCallback(
    (lat, lng, shouldResolveAddress = true) => {
      setPosition((prev) => {
        const next = { lat, lng };
        return areSameCoords(prev, next) ? prev : next;
      });

      if (shouldResolveAddress) {
        resolveAddressByCoords(lat, lng);
      }
    },
    [resolveAddressByCoords]
  );

  const handleInputChange = useCallback(
    (event) => {
      const text = event.target.value;
      setAddress(text);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (searchAbortRef.current) searchAbortRef.current.abort();

      if (text.trim().length < 3) {
        setSuggestions([]);
        setShowDropdown(false);
        setIsSearching(false);
        onChange(null);
        return;
      }

      onChange(null);
      setShowDropdown(true);
      setIsSearching(true);

      searchTimeoutRef.current = setTimeout(async () => {
        searchAbortRef.current = new AbortController();

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              text
            )}&limit=5&countrycodes=vn`,
            {
              signal: searchAbortRef.current.signal,
              headers: {
                Accept: "application/json",
              },
            }
          );

          setSuggestions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error("[LocationPicker] Search address error:", error);
          }
        } finally {
          setIsSearching(false);
        }
      }, SEARCH_DELAY);
    },
    [onChange]
  );

  const handleSelectSuggestion = useCallback(
    (item) => {
      const newLat = parseFloat(item.lat);
      const newLng = parseFloat(item.lon);
      const foundAddress = item.display_name || "";

      if (Number.isNaN(newLat) || Number.isNaN(newLng)) return;

      setPosition({ lat: newLat, lng: newLng });
      setAddress(foundAddress);
      setShowDropdown(false);
      setSuggestions([]);
      emitChange(newLat, newLng, foundAddress);
    },
    [emitChange]
  );

  const handleClearAddress = useCallback(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (reverseTimeoutRef.current) clearTimeout(reverseTimeoutRef.current);
    if (searchAbortRef.current) searchAbortRef.current.abort();
    if (reverseAbortRef.current) reverseAbortRef.current.abort();

    setAddress("");
    setSuggestions([]);
    setShowDropdown(false);
    setIsSearching(false);
    setIsResolvingAddress(false);
    onChange(null);
  }, [onChange]);

  const handleMapClick = useCallback(
    (lat, lng) => {
      handlePositionChange(lat, lng, true);
    },
    [handlePositionChange]
  );

  const markerHandlers = useMemo(
    () => ({
      dragend(event) {
        const marker = event.target;
        const nextPosition = marker.getLatLng();
        handlePositionChange(nextPosition.lat, nextPosition.lng, true);
      },
    }),
    [handlePositionChange]
  );

  const markerPosition = useMemo(
    () => [position.lat, position.lng],
    [position.lat, position.lng]
  );

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
          className={`w-full rounded-2xl border py-3 pl-11 pr-12 shadow-sm outline-none transition focus:border-[#FBBF24] focus:ring-4 focus:ring-[#FBBF24]/20 ${
            hasError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white"
          }`}
          autoComplete="off"
        />

        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={19} />

        {(isSearching || isResolvingAddress) && (
          <div className="absolute right-10 top-3.5 text-[#F59E0B]">
            <Loader2 className="animate-spin" size={18} />
          </div>
        )}

        {!!address && !isSearching && !isResolvingAddress && (
          <button
            type="button"
            onClick={handleClearAddress}
            className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Xóa địa chỉ"
          >
            <X size={16} />
          </button>
        )}

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-[120] mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.12)]">
            {suggestions.map((item, index) => (
              <li
                key={`${item.place_id || index}-${item.lat}-${item.lon}`}
                onClick={() => handleSelectSuggestion(item)}
                className="flex cursor-pointer items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
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

      {shouldRenderMap ? (
        <div
          className={`relative z-0 overflow-hidden rounded-2xl border ${
            hasError
              ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.16)]"
              : "border-slate-200"
          }`}
        >
          <MapContainer
            center={markerPosition}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={false}
            preferCanvas
            zoomControl={false}
            attributionControl={false}
            className={`w-full ${MAP_HEIGHT_CLASS}`}
            whenReady={(event) => {
              requestAnimationFrame(() => {
                event.target.invalidateSize(false);
              });
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              updateWhenIdle
              updateWhenZooming={false}
              keepBuffer={2}
            />

            <Marker
              draggable
              position={markerPosition}
              eventHandlers={markerHandlers}
            />

            <MapEvents onMapClick={handleMapClick} />
            <MapUpdater center={position} zoom={DEFAULT_ZOOM} />
          </MapContainer>
        </div>
      ) : (
        <MapSkeleton hasError={hasError} />
      )}

      <p className="flex items-center gap-1.5 pl-1 text-xs font-medium text-slate-500">
        <MapPin size={14} className="text-[#F59E0B]" />
        Kéo thả ghim trên bản đồ để tinh chỉnh vị trí chính xác.
      </p>
    </div>
  );
}

const LocationPicker = memo(
  LocationPickerComponent,
  (prevProps, nextProps) => {
    const prevValue = prevProps.value;
    const nextValue = nextProps.value;

    const sameAddress =
      (prevValue?.address || "") === (nextValue?.address || "");

    const sameLng =
      (prevValue?.coordinates?.[0] ?? null) ===
      (nextValue?.coordinates?.[0] ?? null);

    const sameLat =
      (prevValue?.coordinates?.[1] ?? null) ===
      (nextValue?.coordinates?.[1] ?? null);

    const sameError = prevProps.hasError === nextProps.hasError;

    return sameAddress && sameLng && sameLat && sameError;
  }
);

export { LocationPicker };
export default LocationPicker;