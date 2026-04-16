import { BellRing, SendHorizontal } from "lucide-react";
import FloatingAlert from "./notificationComposer/FloatingAlert";
import NotificationComposerMainForm from "./notificationComposer/NotificationComposerMainForm";
import NotificationComposerSidebar from "./notificationComposer/NotificationComposerSidebar";
import useAdminNotificationComposer from "../hooks/useAdminNotificationComposer";

export default function AdminNotificationComposer() {
  const {
    form,
    selectedRoles,
    roleSelections,
    isSubmitting,
    alert,
    titleCount,
    messageCount,
    summaryText,
    clearAlert,
    handleChange,
    toggleRole,
    updateRoleSelection,
    handleSubmit,
  } = useAdminNotificationComposer();

  return (
    <>
      <FloatingAlert
        type={alert.type}
        message={alert.message}
        onClose={clearAlert}
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-inner">
            <BellRing size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Send system notification
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Choose recipients by role. For each selected role, leaving the
              list empty means send to the full role. Selecting users means send
              only to those users in that role.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <NotificationComposerMainForm
              form={form}
              titleCount={titleCount}
              messageCount={messageCount}
              selectedRoles={selectedRoles}
              roleSelections={roleSelections}
              onChange={handleChange}
              onToggleRole={toggleRole}
              onUpdateRoleSelection={updateRoleSelection}
            />

            <NotificationComposerSidebar
              form={form}
              summaryText={summaryText}
              isSubmitting={isSubmitting}
              onChange={handleChange}
            />
          </div>
        </form>
      </section>
    </>
  );
}