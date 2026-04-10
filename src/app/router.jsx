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
import OrganizerRequestsPage from "@/features/admin/pages/OrganizerRequestsPage";
import OrganizerRequestDetailPage from "@/features/admin/pages/OrganizerRequestDetailPage";
import AdminProjectPreviewPage from "@/features/admin/pages/AdminProjectPreviewPage";
import AdminNotificationsPage from "@/features/admin/pages/AdminNotificationsPage";
import AdminNeedHelpRequestsPage from "@/features/needHelp/pages/AdminNeedHelpRequestsPage";
import AdminHelpRequestDetailPage from "@/features/needHelp/pages/AdminHelpRequestDetailPage";
import { PaymentResultPage } from "@/features/transaction/pages/PaymentResultPage";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage || m.default,
  })),
);

const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage || m.default,
  })),
);

const VerifyOTPPage = lazy(() =>
  import("@/features/auth/pages/VerifyOTPPage").then((m) => ({
    default: m.VerifyOTPPage || m.default,
  })),
);

const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage || m.default,
  })),
);

const ChangePasswordPage = lazy(() =>
  import("@/features/auth/pages/ChangePasswordPage").then((m) => ({
    default: m.ChangePasswordPage || m.default,
  })),
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage || m.default,
  })),
);

const UserProfilePage = lazy(() =>
  import("@/features/users/pages/UserProfilePage").then((m) => ({
    default: m.UserProfilePage || m.default,
  })),
);

const SupportedProjectsPage = lazy(() =>
  import("@/features/users/pages/SupportedProjectsPage").then((m) => ({
    default: m.SupportedProjectsPage || m.default,
  })),
);

const FollowingPage = lazy(() =>
  import("@/features/users/pages/FollowingPage").then((m) => ({
    default: m.FollowingPage || m.default,
  })),
);

const BecomeOrganizerPage = lazy(() =>
  import("@/features/users/pages/BecomeOrganizerPage").then((m) => ({
    default: m.BecomeOrganizerPage || m.default,
  })),
);

const MyOrganizerRequestPage = lazy(() =>
  import("@/features/users/pages/MyOrganizerRequestPage").then((m) => ({
    default: m.MyOrganizerRequestPage || m.default,
  })),
);

const CommunityPage = lazy(() =>
  import("@/features/community/pages/CommunityPage").then((m) => ({
    default: m.CommunityPage || m.default,
  })),
);

const PostDetailPage = lazy(() =>
  import("@/features/community/pages/PostDetailPage").then((m) => ({
    default: m.PostDetailPage || m.default,
  })),
);

const ProjectListPage = lazy(() =>
  import("@/features/project/pages/ProjectListPage").then((m) => ({
    default: m.ProjectListPage || m.default,
  })),
);

const ProjectDetailPage = lazy(() =>
  import("@/features/project/pages/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage || m.default,
  })),
);

const CreateProjectPage = lazy(() =>
  import("@/features/project/pages/CreateProjectPage").then((m) => ({
    default: m.CreateProjectPage || m.default,
  })),
);

const OrganizerWorkspacePage = lazy(() =>
  import("@/features/project/pages/OrganizerWorkspacePage").then((m) => ({
    default: m.OrganizerWorkspacePage || m.default,
  })),
);

const NeedHelpPage = lazy(() =>
  import("@/features/needHelp/pages/NeedHelpPage").then((m) => ({
    default: m.NeedHelpPage || m.default,
  })),
);

const HelpRequestDetailPage = lazy(() =>
  import("@/features/needHelp/pages/HelpRequestDetailPage").then((m) => ({
    default: m.HelpRequestDetailPage || m.default,
  })),
);

const CreateHelpRequestPage = lazy(() =>
  import("@/features/needHelp/pages/CreateHelpRequestPage").then((m) => ({
    default: m.CreateHelpRequestPage || m.default,
  })),
);

const EditHelpRequestPage = lazy(() =>
  import("@/features/needHelp/pages/EditHelpRequestPage").then((m) => ({
    default: m.EditHelpRequestPage || m.default,
  })),
);

const OrganizerAssignedRequestsPage = lazy(() =>
  import("@/features/needHelp/pages/OrganizerAssignedRequestsPage").then(
    (m) => ({
      default: m.OrganizerAssignedRequestsPage || m.default,
    }),
  ),
);

const SearchPage = lazy(() =>
  import("@/features/search/pages/SearchPage").then((m) => ({
    default: m.SearchPage || m.default,
  })),
);

const ChatPage = lazy(() =>
  import("@/features/chat/pages/ChatPage").then((m) => ({
    default: m.ChatPage || m.default,
  })),
);

const NotificationDetailPage = lazy(() =>
  import("@/features/notification/pages/NotificationDetailPage").then((m) => ({
    default: m.NotificationDetailPage || m.default,
  })),
);

const MockAdminPage = ({ title }) => (
  <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-slate-400">
      Trang {title} (Đang xây dựng)
    </h2>
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: (
      <PublicRoute>
        <Outlet />
      </PublicRoute>
    ),
    children: [
      { path: "login", element: withSuspense(LoginPage) },
      { path: "register", element: withSuspense(RegisterPage) },
      { path: "verify-otp", element: withSuspense(VerifyOTPPage) },
      { path: "forgot-password", element: withSuspense(ForgotPasswordPage) },
    ],
  },

  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <AuthGateway /> },

      {
        path: "projects",
        children: [
          { index: true, element: withSuspense(ProjectListPage) },
          {
            path: "create",
            element: (
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, "organizer"]}>
                {withSuspense(CreateProjectPage)}
              </ProtectedRoute>
            ),
          },
          {
            path: "create/:id/edit",
            element: (
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, "organizer"]}>
                {withSuspense(CreateProjectPage)}
              </ProtectedRoute>
            ),
          },
          { path: ":id", element: withSuspense(ProjectDetailPage) },
        ],
      },

      {
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, "organizer"]}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "workspace",
            element: withSuspense(OrganizerWorkspacePage),
          },
          {
            path: "workspace/projects",
            element: withSuspense(OrganizerWorkspacePage),
          },
          {
            path: "workspace/stats",
            element: <MockAdminPage title="Thống Kê Gây Quỹ" />,
          },
          {
            path: "organizer/need-help",
            element: withSuspense(OrganizerAssignedRequestsPage),
          },
        ],
      },

      { path: "search", element: withSuspense(SearchPage) },

      { path: "projects", element: withSuspense(ProjectListPage) },
      { path: "projects/:id", element: withSuspense(ProjectDetailPage) },
      { path: "users/:id", element: withSuspense(UserProfilePage) },
      { path: "need-help", element: withSuspense(NeedHelpPage) },
      { path: "need-help/:id", element: withSuspense(HelpRequestDetailPage) },
      { path: "payment/result", element: <PaymentResultPage /> },

      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "profile/supported-projects",
            element: withSuspense(SupportedProjectsPage),
          },
          { path: "profile", element: withSuspense(UserProfilePage) },
          {
            path: "organizer/apply",
            element: withSuspense(BecomeOrganizerPage),
          },
          {
            path: "organizer/request",
            element: withSuspense(MyOrganizerRequestPage),
          },
          { path: "messages", element: withSuspense(ChatPage) },
          { path: "messages/:conversationId", element: withSuspense(ChatPage) },
          { path: "change-password", element: withSuspense(ChangePasswordPage) },
          {
            path: "notifications/:id",
            element: withSuspense(NotificationDetailPage),
          },
        ],
      },

      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={[ROLES.USER, "user"]}>
            {withSuspense(DashboardPage)}
          </ProtectedRoute>
        ),
      },

      {
        element: (
          <ProtectedRoute allowedRoles={CONSUMER_ROLES}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: "following", element: withSuspense(FollowingPage) },
          { path: "community", element: withSuspense(CommunityPage) },
          { path: "community/:id", element: withSuspense(PostDetailPage) },
          {
            path: "need-help/create",
            element: withSuspense(CreateHelpRequestPage),
          },
          {
            path: "need-help/:id/edit",
            element: withSuspense(EditHelpRequestPage),
          },
        ],
      },

      {
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ORGANIZER]}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "projects/create",
            element: withSuspense(CreateProjectPage),
          },
          {
            path: "workspace/projects",
            element: withSuspense(WorkspaceProjectsPage),
          },
          {
            path: "workspace/stats",
            element: <MockAdminPage title="Thống Kê Gây Quỹ" />,
          },
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
      { index: true, element: <AdminDashboard /> },
      { path: "notifications", element: <AdminNotificationsPage /> },
      { path: "users", element: <UserManagement /> },
      { path: "organizers", element: <OrganizerRequestsPage /> },
      { path: "organizers/:id", element: <OrganizerRequestDetailPage /> },
      { path: "need-help", element: <AdminNeedHelpRequestsPage /> },
      { path: "need-help/:id", element: <AdminHelpRequestDetailPage /> },
      { path: "projects", element: <ProjectManagement /> },
      { path: "projects/:id", element: <AdminProjectPreviewPage /> },
      { path: "reports", element: <ReportManagement /> },
    ],
  },

  {
    path: "*",
    element: (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-400">
        <h1 className="mb-4 text-6xl font-black">404</h1>
        <p className="text-xl font-medium">Trang không tồn tại</p>
      </div>
    ),
  },
]);