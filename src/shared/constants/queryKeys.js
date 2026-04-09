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
    lists: () => [...queryKeys.projects.all, 'list'],
    list: (filters) => [...queryKeys.projects.lists(), { filters }],
    myLists: () => [...queryKeys.projects.all, 'my-list'],
    myList: (filters) => [...queryKeys.projects.myLists(), { filters }],
    details: () => [...queryKeys.projects.all, 'detail'],
    detail: (id) => [...queryKeys.projects.details(), id],
  },
  
  helpRequests: {
    all: ['helpRequests'],
    lists: () => [...queryKeys.helpRequests.all, 'list'],
    list: (filters) => [...queryKeys.helpRequests.lists(), { filters }],
    myLists: () => [...queryKeys.helpRequests.all, 'my-list'],
    myList: (filters) => [...queryKeys.helpRequests.myLists(), { filters }],
    urgent: () => [...queryKeys.helpRequests.all, 'urgent'],
    nearby: (params) => [...queryKeys.helpRequests.all, 'nearby', params],
    details: () => [...queryKeys.helpRequests.all, 'detail'],
    detail: (id) => [...queryKeys.helpRequests.details(), id],
  },

  dashboard: {
    all: ['dashboard'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    activities: () => [...queryKeys.dashboard.all, 'activities'],
  },

  organizerRequests: {
    all: ['organizerRequests'],
    me: () => [...queryKeys.organizerRequests.all, 'me'],
  },

  adminOrganizerRequests: {
    all: ['admin', 'organizerRequests'],
    lists: () => [...queryKeys.adminOrganizerRequests.all, 'list'],
    list: (filters) => [...queryKeys.adminOrganizerRequests.lists(), { filters }],
    details: () => [...queryKeys.adminOrganizerRequests.all, 'detail'],
    detail: (id) => [...queryKeys.adminOrganizerRequests.details(), id],
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

  projects: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  },

  project: (queryClient, projectId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
  },

  helpRequests: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.helpRequests.all });
  },

  helpRequest: (queryClient, helpRequestId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.helpRequests.detail(helpRequestId) });
  },
};