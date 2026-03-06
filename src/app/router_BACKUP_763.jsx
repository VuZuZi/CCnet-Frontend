<<<<<<< HEAD
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
=======
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/shared/components/layouts/RootLayout";
import { ProtectedRoute } from "@/shared/components/common/ProtectedRoute";
import { PublicRoute } from "@/shared/components/common/PublicRoute";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { VerifyOTPPage } from "@/features/auth/pages/VerifyOTPPage";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CommunityPage } from "@/features/community/pages/CommunityPage";
import { CreatePostPage } from "@/features/community/pages/CreatePostPage";
import { PostDetailPage } from "@/features/community/pages/PostDetailPage";
>>>>>>> parent of 0c3c1a3 (Merge remote-tracking branch 'origin/feature_Post_Dung_1.0' into feature_authen_Hieu_1.0)
import AdminDashboard from "@/features/admin/pages/AdminDashboard";

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
<<<<<<< HEAD
        path: 'community',
=======
        path: "community",
>>>>>>> parent of 0c3c1a3 (Merge remote-tracking branch 'origin/feature_Post_Dung_1.0' into feature_authen_Hieu_1.0)
        children: [
          {
            index: true,
            element: <CommunityPage />,
          },
          {
<<<<<<< HEAD
            path: 'create',
=======
            path: "create",
>>>>>>> parent of 0c3c1a3 (Merge remote-tracking branch 'origin/feature_Post_Dung_1.0' into feature_authen_Hieu_1.0)
            element: (
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            ),
          },
          {
<<<<<<< HEAD
            path: ':postId',
            element: <PostDetailPage />,
          },
        ],
      },   
=======
            path: ":postId",
            element: <PostDetailPage />,
          },
        ],
      },
>>>>>>> parent of 0c3c1a3 (Merge remote-tracking branch 'origin/feature_Post_Dung_1.0' into feature_authen_Hieu_1.0)
    ],
  },
]);
