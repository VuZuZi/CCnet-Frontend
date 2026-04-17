function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value || "--"}
      </p>
    </div>
  );
}

function ResolutionModeList({ roleSelections = [], resolutionBreakdown = [] }) {
  const rows = roleSelections.map((selection) => {
    const matched = resolutionBreakdown.find(
      (item) => item.role === selection.role
    );

    return {
      role: selection.role,
      mode:
        matched?.mode === "selected_users" ? "Chỉ người dùng đã chọn" : "Tất cả trong vai trò",
      selectedCount: matched?.requestedUserCount || 0,
      resolvedCount: matched?.resolvedRecipientCount || 0,
    };
  });

  if (!rows.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        Phân giải vai trò
      </p>

      <div className="mt-3 grid gap-3">
        {rows.map((row) => (
          <div
            key={row.role}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold capitalize text-slate-900">
                  {row.role}
                </p>
                <p className="mt-1 text-xs text-slate-500">{row.mode}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                  Đã chọn: {row.selectedCount}
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700">
                  Cuối cùng: {row.resolvedCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecipientAudienceBlock({
  targetType,
  roles,
  roleSelections,
  resolvedRecipientCount,
  resolutionBreakdown,
}) {
  const normalizedTargetType = String(targetType || "all").toLowerCase();

  const audienceText =
    normalizedTargetType === "all"
      ? "Đã gửi đến tất cả người dùng trong hệ thống."
      : "Mỗi vai trò được chọn tuân theo quy tắc riêng: nếu không có người dùng cụ thể nào được chọn trong vai trò đó, hệ thống sẽ gửi cho toàn bộ vai trò; nếu không, hệ thống chỉ gửi cho những người dùng được chọn trong vai trò đó.";

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-black tracking-tight text-slate-900">
        Đối tượng nhận
      </h4>

      <p className="mt-3 text-sm leading-6 text-slate-600">{audienceText}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InfoRow label="Loại mục tiêu" value={normalizedTargetType} />
        <InfoRow
          label="Nhóm vai trò"
          value={roles?.length ? roles.join(", ") : "--"}
        />
        <InfoRow
          label="Số lượng người nhận thực tế"
          value={
            resolvedRecipientCount !== null &&
            resolvedRecipientCount !== undefined
              ? String(resolvedRecipientCount)
              : "Không được ghi lại"
          }
        />
      </div>

      <ResolutionModeList
        roleSelections={roleSelections}
        resolutionBreakdown={resolutionBreakdown}
      />
    </div>
  );
}