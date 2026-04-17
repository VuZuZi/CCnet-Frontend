import {
  getAdminUIStatusLabel,
  getAdminUIStatusStyle,
  mapProjectStatusToUI,
} from "../../utils/projectStatus.utils";
import { STATUS_ICON_MAP } from "../../utils/adminProjectDetailModal.utils";

export default function ProjectStatusBanner({ project }) {
  const uiStatus = mapProjectStatusToUI(project?.status);
  const currentStatusStyle = getAdminUIStatusStyle(uiStatus);
  const currentStatusLabel = getAdminUIStatusLabel(uiStatus);
  const StatusIcon = STATUS_ICON_MAP[uiStatus] || STATUS_ICON_MAP.DEFAULT;

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${currentStatusStyle.bg} ${currentStatusStyle.border}`}
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
          Các hành động quản trị yêu cầu cung cấp lý do sẽ được thực hiện ở trang chính để lưu trữ lịch sử đầy đủ.
        </p>
      </div>
    </div>
  );
}