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
  
  dashboard: {
    all: ['dashboard'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    activities: () => [...queryKeys.dashboard.all, 'activities'],
  },

  posts: {
    all: ['posts'],
    feeds: () => [...queryKeys.posts.all, 'feed'],
    feed: (filters) => [...queryKeys.posts.feeds(), { ...filters }], 
    
    details: () => [...queryKeys.posts.all, 'detail'],
    detail: (id) => [...queryKeys.posts.details(), id],
    
    comments: (postId) => [...queryKeys.posts.detail(postId), 'comments'],
  }
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

  posts: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.feeds() });
  },

  postDetail: (queryClient, postId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
  },
};