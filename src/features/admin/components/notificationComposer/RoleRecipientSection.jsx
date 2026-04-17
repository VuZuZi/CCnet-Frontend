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
            Người nhận {roleOption.label}
          </h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Để trống nếu muốn gửi đến tất cả người dùng {roleOption.label.toLowerCase()}.
            Nếu bạn chọn một hoặc nhiều người dùng ở đây, chỉ những người dùng đó mới nhận được thông báo.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Người dùng {roleOption.label} cụ thể</FieldLabel>
        <div className="mt-3">
          <UserMultiSelect
            value={selectedUsers}
            onChange={onChange}
            allowedRoles={[role]}
            placeholder={`Chọn người dùng ${roleOption.label.toLowerCase()}... Để trống để chọn tất cả.`}
          />
        </div>
      </div>
    </div>
  );
}