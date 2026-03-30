import { useState, useEffect, useRef } from 'react';
import { Search, MapPinned, XCircle } from 'lucide-react';
import { useLocationContext } from './LocationProvider';
import { useSearchAddress } from './useLocationQueries';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function SearchInput({ hasError }) {
  const [draftValue, setDraftValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const setCoordinates = useLocationContext((state) => state.setCoordinates);
  const setAddress = useLocationContext((state) => state.setAddress);
  const globalAddress = useLocationContext((state) => state.address);
  const setOsmData = useLocationContext((state) => state.setOsmData);

  const debouncedSearchTerm = useDebounce(draftValue, 400);

  const { data: suggestions, isFetching } = useSearchAddress(debouncedSearchTerm);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (feature) => {
    const coords = feature.geometry.coordinates;
    const addressName = [
      feature.properties.name,
      feature.properties.city,
      feature.properties.state
    ].filter(Boolean).join(', ');

    const { osm_id, osm_type } = feature.properties;

    setCoordinates(coords, 'SEARCH');
    setAddress(addressName);
    setDraftValue(addressName);
    setOsmData(osm_type, osm_id);
    setShowDropdown(false);
  };

  const clearInput = () => {
    setDraftValue('');
    setAddress('');
    setShowDropdown(false);
  };

  const displayedValue = showDropdown ? draftValue : (globalAddress || draftValue);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 text-slate-400" size={18} />
        <input
          type="text"
          value={displayedValue}
          onChange={(e) => {
            setDraftValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setDraftValue(globalAddress || '');
            setShowDropdown(true);
          }}
          placeholder="Tìm kiếm địa điểm (VD: Bitexco, Đà Nẵng)..."
          className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none ${hasError ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
            }`}
          autoComplete="off"
        />
        {displayedValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>

      {showDropdown && draftValue.length >= 3 && (
        <div className="absolute z-[1001] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto overscroll-contain">
          {isFetching ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-2 animate-pulse">
                  <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions?.length > 0 ? (
            <ul className="divide-y divide-slate-100 py-1">
              {suggestions.map((feature, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(feature)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex gap-3 items-start transition-colors"
                >
                  <MapPinned className="text-slate-400 shrink-0 mt-0.5" size={16} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 line-clamp-1">
                      {feature.properties.name}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {[feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              Không tìm thấy kết quả phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
