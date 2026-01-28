import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/shared/components/layouts/RootLayout';
import { ProtectedRoute } from '@/shared/components/common/ProtectedRoute';
import { PublicRoute } from '@/shared/components/common/PublicRoute';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyOTPPage } from '@/features/auth/pages/VerifyOTPPage';
import { ProfilePage } from '@/features/user/pages/ProfilePage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import CommunityPage from '@/features/Community/pages/CommunityPage';
import { PostDetailPage } from '@/features/Community/pages/PostDetailPage';
import { CreatePostPage } from "@/features/community/pages/CreatePostPage";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";

import { UserProfilePage } from '@/features/users/pages/UserProfilePage';
import { FollowingPage } from '@/features/users/pages/FollowingPage';
import { ProjectListPage, ProjectDetailPage, CreateProjectPage } from '@/features/project/pages';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },

      {
        path: "login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: "verify-otp",
        element: (
          <PublicRoute>
            <VerifyOTPPage />
          </PublicRoute>
        ),
      },

      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'community',
        children: [
          {
            index: true,
            element: <CommunityPage />,
          },
          {

            path: "create",
            element: (
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            ),
          },
          {

            path: ":postId",
            element: <PostDetailPage />,
          },
        ],
      },
      {
        path: 'following',
        element: (
          <ProtectedRoute>
            <FollowingPage />
          </ProtectedRoute>
        ),
      },

      {
        path: 'users/:id',
        element: (
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
      // Project Routes
      {
        path: 'projects',
        element: <ProjectListPage />,
      },
      {
        path: 'projects/create',
        element: (
          <ProtectedRoute>
            <CreateProjectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id',
        element: <ProjectDetailPage />,
      },
    ],
  },
]);
