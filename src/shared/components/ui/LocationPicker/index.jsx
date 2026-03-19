import { useEffect, useRef } from 'react';
import { LocationProvider, useLocationContext } from './LocationProvider';
import { SearchInput } from './SearchInput';
import { MapDisplay } from './MapDisplay';

function LocationSync({ onChange }) {
  const coordinates = useLocationContext((state) => state.coordinates);
  const address = useLocationContext((state) => state.address);
  
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!coordinates || !address) return;

    onChangeRef.current({
      type: 'Point',
      coordinates: coordinates,
      address: address,
    });
  }, [coordinates, address]);

  return null;
}

export function LocationPicker({ value, onChange, hasError }) {
  return (
    <LocationProvider initialValue={value}>
      <div className="space-y-3 flex flex-col w-full relative">
        <SearchInput hasError={hasError} />
        <MapDisplay hasError={hasError} />
        
        <p className="text-[11px] text-slate-500 font-medium pl-1 tracking-wide">
          GỢI Ý: Kéo bản đồ để ghim vị trí chính xác.
        </p>
        
        <LocationSync onChange={onChange} />
      </div>
    </LocationProvider>
  );
}

export default LocationPicker;