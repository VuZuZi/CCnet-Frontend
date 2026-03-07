export const PUBLIC_ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  PRICING: '/pricing',
  ABOUT: '/about',
  CONTACT: '/contact',
  USER_PROFILE: '/users/:id',
};

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FOLLOWING: '/following',
  PROJECT_CREATE: '/projects/create',
};

export const PROJECT_ROUTES = {
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
};

export const LEGAL_ROUTES = {
  PRIVACY: '/privacy',
  TERMS: '/terms',
};

export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...PROTECTED_ROUTES,
  ...PROJECT_ROUTES,
  ...LEGAL_ROUTES,
};

export const isProtectedRoute = (path) => {
  return Object.values(PROTECTED_ROUTES).includes(path);
};

export const isAuthRoute = (path) => {
  return Object.values(AUTH_ROUTES).includes(path);
};

export const getRedirectPath = (intendedPath) => {
  if (intendedPath && isProtectedRoute(intendedPath)) {
    return intendedPath;
  }
  return PROTECTED_ROUTES.DASHBOARD;
};
