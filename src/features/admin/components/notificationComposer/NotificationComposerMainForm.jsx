import { Check } from "lucide-react";
import RoleRecipientSection from "./RoleRecipientSection";
import { ROLE_OPTIONS } from "../../utils/adminNotificationComposer.constants";

function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
      {children}
    </label>
  );
}

export default function NotificationComposerMainForm({
  form,
  titleCount,
  messageCount,
  selectedRoles,
  roleSelections,
  onChange,
  onToggleRole,
  onUpdateRoleSelection,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <FieldLabel>Title</FieldLabel>
              <span className="text-xs font-medium text-slate-400">
                {titleCount}/200
              </span>
            </div>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={onChange}
              maxLength={200}
              placeholder="System maintenance tonight"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <FieldLabel>Message</FieldLabel>
              <span className="text-xs font-medium text-slate-400">
                {messageCount}/1000
              </span>
            </div>

            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              rows={5}
              maxLength={1000}
              placeholder="We will perform a scheduled update at 10:00 PM tonight."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>
      </div>

      {form.recipientMode === "custom" ? (
        <div className="space-y-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-3">
            <FieldLabel>Role groups</FieldLabel>

            <div className="flex flex-wrap gap-3">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = selectedRoles.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onToggleRole(option.value)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "border-amber-300 bg-amber-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <Icon size={16} />
                    {option.label}
                    {isActive ? <Check size={14} /> : null}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">
              Turn on one or more roles. For each enabled role, you can
              optionally narrow the recipients to selected users only.
            </p>
          </div>

          {selectedRoles.length ? (
            <div className="space-y-4">
              {ROLE_OPTIONS.filter((option) =>
                selectedRoles.includes(option.value)
              ).map((option) => (
                <RoleRecipientSection
                  key={option.value}
                  roleOption={option}
                  selectedUsers={roleSelections[option.value] || []}
                  onChange={(users) =>
                    onUpdateRoleSelection(option.value, users)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
              Select at least one role to configure recipients.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}