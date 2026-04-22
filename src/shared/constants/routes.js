import { ROLES } from './roles';

export const PUBLIC_ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  PRICING: '/pricing',
  ABOUT: '/about',
  CONTACT: '/contact',
};

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
};

export const PROTECTED_ROUTES = {
  DASHBOARD: '/profile/supported-projects',
  PROFILE: '/profile',
  FOLLOWING: '/following',
  COMMUNITY: '/community',
  WORKSPACE: '/workspace',
  WORKSPACE_PROJECTS: '/workspace',
};

export const PROJECT_ROUTES = {
  PROJECTS: '/projects', 
  PROJECT_DETAIL: '/projects/:id', 
  PROJECT_CREATE: '/projects/create',
};

export const ADMIN_ROUTES = {
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_NEED_HELP: '/admin/need-help',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_REPORTS: '/admin/reports',
};

export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...PROTECTED_ROUTES,
  ...PROJECT_ROUTES,
  ...ADMIN_ROUTES,
};

export const isProtectedRoute = (path) => {
  const protectedPaths = Object.values(PROTECTED_ROUTES);
  const adminPaths = Object.values(ADMIN_ROUTES);
  
  const isBaseProtected = protectedPaths.some(p => path.startsWith(p));
  const isAdminProtected = adminPaths.some(p => path.startsWith(p));
  
  const isProjectCreate = path === PROJECT_ROUTES.PROJECT_CREATE;

  return isBaseProtected || isAdminProtected || isProjectCreate;
};

export const isAuthRoute = (path) => {
  return Object.values(AUTH_ROUTES).some(p => path.startsWith(p));
};

export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.MANAGER:
      return ADMIN_ROUTES.ADMIN_DASHBOARD; 
      
    case ROLES.ORGANIZER:
      return PROJECT_ROUTES.PROJECTS;
      
    case ROLES.USER:
    default:
      return PROJECT_ROUTES.PROJECTS; 
  }
};

export const getRedirectPath = (intendedPath, role) => {
  if (intendedPath && isProtectedRoute(intendedPath)) {
    return intendedPath;
  }
  return getDefaultRouteByRole(role);
};