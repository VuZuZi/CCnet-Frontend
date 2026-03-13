import { createBrowserRouter, Outlet } from "react-router-dom";

import { RootLayout } from "@/shared/components/layouts/RootLayout";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { ProtectedRoute } from "@/shared/components/common/ProtectedRoute";
import { PublicRoute } from "@/shared/components/common/PublicRoute";
import { AuthGateway } from "@/shared/components/common/AuthGateway";
import { ADMIN_ROLES, CONSUMER_ROLES } from "@/shared/constants/roles";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { VerifyOTPPage } from "@/features/auth/pages/VerifyOTPPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CommunityPage } from "@/features/community/pages/CommunityPage";
import { CreatePostPage } from "@/features/community/pages/CreatePostPage";
import { PostDetailPage } from "@/features/community/pages/PostDetailPage";
import { UserProfilePage } from "@/features/users/pages/UserProfilePage";
import { FollowingPage } from "@/features/users/pages/FollowingPage";
import { ProjectListPage, ProjectDetailPage, CreateProjectPage } from "@/features/project/pages";

const MockAdminPage = ({ title }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-[60vh] flex items-center justify-center">
    <h2 className="text-2xl font-bold text-slate-400">Trang {title} (Đang xây dựng)</h2>
  </div>
);

export const router = createBrowserRouter([
  {
    element: <PublicRoute><Outlet /></PublicRoute>,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify-otp", element: <VerifyOTPPage /> },
    ],
  },

  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <AuthGateway /> }, 
      
      { path: "projects", element: <ProjectListPage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },
      { path: "users/:id", element: <UserProfilePage /> },
      
      {
        element: <ProtectedRoute allowedRoles={CONSUMER_ROLES}><Outlet /></ProtectedRoute>,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "profile", element: <UserProfilePage /> },
          { path: "following", element: <FollowingPage /> },
          { path: "projects/create", element: <CreateProjectPage /> }, 
          { path: "community", element: <CommunityPage /> },
          { path: "community/create", element: <CreatePostPage /> },
          { path: "community/:id", element: <PostDetailPage /> },
        ],
      },
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
      { index: true, element: <MockAdminPage title="Tổng Quan (Dashboard)" /> },
      { path: "users", element: <MockAdminPage title="Quản Lý Người Dùng" /> },
      { path: "projects", element: <MockAdminPage title="Kiểm Duyệt Dự Án" /> },
      { path: "reports", element: <MockAdminPage title="Báo Cáo Hệ Thống" /> },
    ],
  },
  
  {
    path: "*",
    element: <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-400">
      <h1 className="text-6xl font-black mb-4">404</h1>
      <p className="text-xl font-medium">Trang không tồn tại</p>
    </div>
  }
]);