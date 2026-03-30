import { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

const LocationContext = createContext(null);

const createLocationStore = (initialProps) => {
  return createStore((set, get) => ({
    // Tọa độ chuẩn trung tâm Đà Nẵng [Lng, Lat]
    coordinates: initialProps?.coordinates || [108.2062, 16.0471], 
    address: initialProps?.address || '',
    
    // UI States
    mode: 'EXPLORE', // 'EXPLORE' (Chỉ xem/kéo map) | 'PICK' (Bấm để thả ghim)
    interactionType: 'INIT', // 'INIT' | 'SEARCH' | 'PICK'
    osmData: null,
    
    // Actions
    setMode: (newMode) => set({ mode: newMode }),
    
    setCoordinates: (coords, type = 'PICK') => set({ 
      coordinates: coords, 
      interactionType: type 
    }),
    
    setAddress: (address) => set({ address }),
    
    setOsmData: (osm_type, osm_id) => set({ 
      osmData: { type: osm_type, id: osm_id },
      interactionType: 'SEARCH',
      mode: 'EXPLORE' // Khi search ra khu vực, chuyển ngay về chế độ xem bao quát
    }),

    // Hàm xóa viền khi user chủ động cắm ghim mới
    clearBoundary: () => set({ osmData: null }),
    
    syncWithForm: (onChangeRef) => {
      const { coordinates, address } = get();
      if (onChangeRef?.current && coordinates && address) {
        onChangeRef.current({ type: 'Point', coordinates, address });
      }
    }
  }));
};

export function LocationProvider({ children, initialValue }) {
  const [store] = useState(() => createLocationStore(initialValue));
  return <LocationContext.Provider value={store}>{children}</LocationContext.Provider>;
}

export function useLocationContext(selector) {
  const store = useContext(LocationContext);
  if (!store) throw new Error('Missing LocationProvider');
  return useStore(store, selector);
}
