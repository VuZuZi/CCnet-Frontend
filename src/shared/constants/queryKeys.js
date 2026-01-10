export const queryKeys = {
  auth: {
    all: ['auth'],
    me: () => [...queryKeys.auth.all, 'me'],
    profile: () => [...queryKeys.auth.all, 'profile'],
  },
  
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
  
  projects: {
    all: ['projects'],
    list: (filters) => [...queryKeys.projects.all, { filters }],
  },
  
  dashboard: {
    all: ['dashboard'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    activities: () => [...queryKeys.dashboard.all, 'activities'],
  },
};

export const invalidateQueries = {
  auth: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
  },
  
  profile: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
  },
  
  users: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
  
  user: (queryClient, userId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
  },
};