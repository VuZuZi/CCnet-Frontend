import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/shared/components/layouts/RootLayout';
import { ProtectedRoute } from '@/shared/components/common/ProtectedRoute';
import { PublicRoute } from '@/shared/components/common/PublicRoute';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyOTPPage } from '@/features/auth/pages/VerifyOTPPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ProjectOverview } from '@/features/project/pages/ProjectOverview';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: 'verify-otp',
        element: (
          <PublicRoute>
            <VerifyOTPPage />
          </PublicRoute>
        ),
      },
      
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'project/projectOverview',
        element: (
          <ProtectedRoute>
            <ProjectOverview />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);