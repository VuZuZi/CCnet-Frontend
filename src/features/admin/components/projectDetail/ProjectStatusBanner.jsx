import {
  getAdminUIStatusLabel,
  getAdminUIStatusStyle,
  mapProjectStatusToUI,
} from "../../utils/projectStatus.utils";
import { STATUS_ICON_MAP } from "../../utils/adminProjectDetailModal.utils";

function formatDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectStatusBanner({ project }) {
  const uiStatus = mapProjectStatusToUI(project?.status);
  const currentStatusStyle = getAdminUIStatusStyle(uiStatus);
  const currentStatusLabel = getAdminUIStatusLabel(uiStatus);
  const StatusIcon = STATUS_ICON_MAP[uiStatus] || STATUS_ICON_MAP.DEFAULT;

  const isUpdating =
    String(project?.status || "").toUpperCase() === "UPDATING";
  const hasOrganizerSubmitted = Boolean(project?.updateSubmittedAt);

  return (
    <div className="space-y-4">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 ${currentStatusStyle.bg} ${currentStatusStyle.border}`}
      >
        <div
          className={`rounded-2xl bg-white p-2 shadow-sm ${currentStatusStyle.text}`}
        >
          <StatusIcon className="h-5 w-5" />
        </div>

        <div>
          <p className={`text-sm font-bold ${currentStatusStyle.text}`}>
            Trạng thái hiện tại: {currentStatusLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Các hành động quản trị yêu cầu cung cấp lý do sẽ được thực hiện ở
            trang chính để lưu trữ lịch sử đầy đủ.
          </p>
        </div>
      </div>

      {isUpdating ? (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-xs">
              🔄
            </span>
            <p className="text-sm font-black text-amber-900">
              Thông tin yêu cầu cập nhật
            </p>
          </div>

          {project?.updateRequestReason ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber-700">
                Lý do yêu cầu
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-amber-900">
                {project.updateRequestReason}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-4 text-xs text-amber-800">
            {project?.updateRequestedAt ? (
              <span>
                <strong>Yêu cầu lúc:</strong>{" "}
                {formatDateTime(project.updateRequestedAt)}
              </span>
            ) : null}

            {hasOrganizerSubmitted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                ✅ Tổ chức đã gửi cập nhật (
                {formatDateTime(project.updateSubmittedAt)})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">
                ⏳ Chờ Tổ chức cập nhật
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
