import { createBrowserRouter, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";

import { RootLayout } from "@/shared/components/layouts/RootLayout";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { ProtectedRoute } from "@/shared/components/common/ProtectedRoute";
import { PublicRoute } from "@/shared/components/common/PublicRoute";
import { AuthGateway } from "@/shared/components/common/AuthGateway";
import { ROLES, ADMIN_ROLES, CONSUMER_ROLES } from "@/shared/constants/roles";
import { PageLoader } from "@/shared/components/ui/PageLoader";

import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import UserManagement from "@/features/admin/pages/UserManagement";
import ProjectManagement from "@/features/admin/pages/ProjectManagement";
import ReportManagement from "@/features/admin/pages/ReportManagement";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then(m => ({ default: m.LoginPage || m.default })));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage").then(m => ({ default: m.RegisterPage || m.default })));
const VerifyOTPPage = lazy(() => import("@/features/auth/pages/VerifyOTPPage").then(m => ({ default: m.VerifyOTPPage || m.default })));

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage || m.default })));
const UserProfilePage = lazy(() => import("@/features/users/pages/UserProfilePage").then(m => ({ default: m.UserProfilePage || m.default })));
const FollowingPage = lazy(() => import("@/features/users/pages/FollowingPage").then(m => ({ default: m.FollowingPage || m.default })));

const CommunityPage = lazy(() => import("@/features/community/pages/CommunityPage").then(m => ({ default: m.CommunityPage || m.default })));
const CreatePostPage = lazy(() => import("@/features/community/pages/CreatePostPage").then(m => ({ default: m.CreatePostPage || m.default })));
const PostDetailPage = lazy(() => import("@/features/community/pages/PostDetailPage").then(m => ({ default: m.PostDetailPage || m.default })));

const ProjectListPage = lazy(() => import("@/features/project/pages/ProjectListPage").then(m => ({ default: m.ProjectListPage || m.default })));
const ProjectDetailPage = lazy(() => import("@/features/project/pages/ProjectDetailPage").then(m => ({ default: m.ProjectDetailPage || m.default })));
const CreateProjectPage = lazy(() => import("@/features/project/pages/CreateProjectPage").then(m => ({ default: m.CreateProjectPage || m.default })));

const MockAdminPage = ({ title }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-[60vh] flex items-center justify-center">
    <h2 className="text-2xl font-bold text-slate-400">Trang {title} (Đang xây dựng)</h2>
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <PublicRoute><Outlet /></PublicRoute>,
    children: [
      { path: "login", element: withSuspense(LoginPage) },
      { path: "register", element: withSuspense(RegisterPage) },
      { path: "verify-otp", element: withSuspense(VerifyOTPPage) },
    ],
  },

  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <AuthGateway /> }, 
      
      { path: "projects", element: withSuspense(ProjectListPage) },
      { path: "projects/:id", element: withSuspense(ProjectDetailPage) },
      { path: "users/:id", element: withSuspense(UserProfilePage) },
      
      {
        element: <ProtectedRoute allowedRoles={CONSUMER_ROLES}><Outlet /></ProtectedRoute>,
        children: [
          { path: "dashboard", element: withSuspense(DashboardPage) },
          { path: "profile", element: withSuspense(UserProfilePage) },
          { path: "following", element: withSuspense(FollowingPage) },
          { path: "community", element: withSuspense(CommunityPage) },
          { path: "community/create", element: withSuspense(CreatePostPage) },
          { path: "community/:id", element: withSuspense(PostDetailPage) },
        ],
      },

      {
        element: <ProtectedRoute allowedRoles={[ROLES.ORGANIZER]}><Outlet /></ProtectedRoute>,
        children: [
          { path: "projects/create", element: withSuspense(CreateProjectPage) },
          { path: "workspace/projects", element: <MockAdminPage title="Dự Án Của Tôi" /> },
          { path: "workspace/stats", element: <MockAdminPage title="Thống Kê Gây Quỹ" /> },
        ]
      }
    ],
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={ADMIN_ROLES}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "projects", element: <ProjectManagement /> },
      { path: "reports", element: <ReportManagement /> },
    ],
  },
  
  {
    path: "*",
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-400">
        <h1 className="text-6xl font-black mb-4">404</h1>
        <p className="text-xl font-medium">Trang không tồn tại</p>
      </div>
    )
  }
]);