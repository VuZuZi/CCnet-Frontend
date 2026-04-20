import { useQuery } from '@tanstack/react-query';
import { helpRequestAPI } from '../api/helpRequestAPI';

export const HELP_REQUEST_KEYS = {
  all: ['helpRequests'],
  lists: () => [...HELP_REQUEST_KEYS.all, 'list'],
  list: (filters) => [...HELP_REQUEST_KEYS.lists(), { filters }],
  myLists: () => [...HELP_REQUEST_KEYS.all, 'my-list'],
  myList: (filters) => [...HELP_REQUEST_KEYS.myLists(), { filters }],
  urgent: () => [...HELP_REQUEST_KEYS.all, 'urgent'],
  nearby: (params) => [...HELP_REQUEST_KEYS.all, 'nearby', params],
  map: () => [...HELP_REQUEST_KEYS.all, 'map'],
  mapViewport: (params) => [...HELP_REQUEST_KEYS.all, 'map-viewport', params],
  organizerAssignedRoot: () => [...HELP_REQUEST_KEYS.all, 'organizer-assigned'],
  organizerAssigned: (filters) => [...HELP_REQUEST_KEYS.organizerAssignedRoot(), filters],
  organizerSuggestions: (id, filters) => [
    ...HELP_REQUEST_KEYS.all,
    'organizer-suggestions',
    id,
    filters,
  ],
  adminActionLogs: (filters) => [...HELP_REQUEST_KEYS.all, 'admin-action-logs', filters],
  details: () => [...HELP_REQUEST_KEYS.all, 'detail'],
  detail: (id) => [...HELP_REQUEST_KEYS.details(), id],
  asProject: (id) => [...HELP_REQUEST_KEYS.all, 'as-project', id],
};

export const useHelpRequests = (filters = {}, page = 1, limit = 12) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.list({ ...filters, page, limit }),
    queryFn: () =>
      helpRequestAPI.getAll({
        page,
        limit,
        ...filters,
      }),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useMyHelpRequests = (filters = {}) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.myList(filters),
    queryFn: () => helpRequestAPI.getMyRequests(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useUrgentHelpRequests = () => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.urgent(),
    queryFn: () => helpRequestAPI.getUrgent({ limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useNearbyHelpRequests = (coordinates, maxDistance = 50000) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.nearby({ coordinates, maxDistance }),
    queryFn: () =>
      helpRequestAPI.getNearby({
        lng: coordinates[0],
        lat: coordinates[1],
        maxDistance,
        limit: 5,
      }),
    enabled: !!coordinates?.length,
    staleTime: 10 * 60 * 1000,
  });
};

export const useHelpRequestMap = (enabled = true) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.map(),
    queryFn: () => helpRequestAPI.getMap(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useHelpRequestMapViewport = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.mapViewport(params),
    queryFn: () => helpRequestAPI.getMapViewport(params),
    enabled:
      Boolean(enabled) &&
      Number.isFinite(Number(params?.north)) &&
      Number.isFinite(Number(params?.south)) &&
      Number.isFinite(Number(params?.east)) &&
      Number.isFinite(Number(params?.west)),
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useHelpRequestDetail = (id) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.detail(id),
    queryFn: () => helpRequestAPI.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useHelpRequestAsProjectData = (id) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.asProject(id),
    queryFn: () => helpRequestAPI.getAsProjectData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrganizerAssignedRequests = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.organizerAssigned(filters),
    queryFn: () => helpRequestAPI.getOrganizerAssigned(filters),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useOrganizerSuggestions = (id, filters = {}, enabled = true) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.organizerSuggestions(id, filters),
    queryFn: () => helpRequestAPI.getOrganizerSuggestions(id, filters),
    enabled: Boolean(id && enabled),
    staleTime: 60 * 1000,
  });
};

export const useAdminHelpRequestActionLogs = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: HELP_REQUEST_KEYS.adminActionLogs(filters),
    queryFn: () => helpRequestAPI.getAdminActionLogs(filters),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
    placeholderData: (previousData) => previousData,
  });
};