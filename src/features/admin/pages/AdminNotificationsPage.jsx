import AdminNotificationComposer from "../components/AdminNotificationComposer";

export function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create and send in-app system notifications to all users, by role, or to selected users.
        </p>
      </div>

      <AdminNotificationComposer />
    </div>
  );
}

export default AdminNotificationsPage;