import UserMultiSelect from "../UserMultiSelect";

function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
      {children}
    </label>
  );
}

export default function RoleRecipientSection({
  roleOption,
  selectedUsers = [],
  onChange,
}) {
  const Icon = roleOption.icon;
  const role = roleOption.value;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Icon size={18} />
        </div>

        <div>
          <h4 className="text-sm font-black text-slate-900">
            {roleOption.label} recipients
          </h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Leave this empty to send to all {roleOption.label.toLowerCase()} users.
            If you choose one or more users here, only those users will receive
            the notification.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>{roleOption.label} specific users</FieldLabel>
        <div className="mt-3">
          <UserMultiSelect
            value={selectedUsers}
            onChange={onChange}
            allowedRoles={[role]}
            placeholder={`Select ${roleOption.label.toLowerCase()} users... Leave empty for all.`}
          />
        </div>
      </div>
    </div>
  );
}