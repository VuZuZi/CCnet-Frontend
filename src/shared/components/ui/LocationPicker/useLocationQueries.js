import { useQuery } from '@tanstack/react-query';
import axios from 'axios'; 

const PHOTON_API_URL = 'https://photon.komoot.io/api';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

export const useSearchAddress = (debouncedSearchTerm) => {
  return useQuery({
    queryKey: ['locationSearch', debouncedSearchTerm],
    queryFn: async ({ signal }) => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) return [];
      const { data } = await axios.get(`${PHOTON_API_URL}/`, {
        params: { 
          q: debouncedSearchTerm, 
          limit: 5,
          bbox: '102.14,8.18,109.46,23.39'
        },
        signal,
      });
      return data.features || [];
    },
    enabled: debouncedSearchTerm.length >= 3,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useReverseGeocode = (coordinates, interactionType) => {
  return useQuery({
    queryKey: ['reverseGeocode', coordinates[0].toFixed(4), coordinates[1].toFixed(4)],
    queryFn: async ({ signal }) => {
      const [lng, lat] = coordinates;
      const { data } = await axios.get(`${NOMINATIM_API_URL}/reverse`, {
        params: { format: 'json', lat, lon: lng, addressdetails: 1 },
        signal,
      });
      return data.display_name;
    },
    enabled: !!coordinates && interactionType === 'PICK',
    staleTime: Infinity,
    retry: false,
  });
};

export const useBoundaryGeom = (osmData) => {
  return useQuery({
    queryKey: ['boundary', osmData?.type, osmData?.id],
    queryFn: async ({ signal }) => {
      if (!osmData) return null;
      const queryId = `${osmData.type}${osmData.id}`;
      const { data } = await axios.get(`${NOMINATIM_API_URL}/lookup`, {
        params: { osm_ids: queryId, polygon_geojson: 1, format: 'json' },
        signal,
      });
      return data[0]?.geojson || null;
    },
    enabled: !!osmData && !!osmData.id,
    staleTime: Infinity,
    retry: false,
  });
};