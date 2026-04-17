import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, FileWarning, ShieldCheck, Info } from "lucide-react";

const STATUS_STYLES = {
  SYSTEM_CHECKING: "bg-indigo-100 text-indigo-800",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS = {
  SYSTEM_CHECKING: "Hệ thống đang kiểm tra",
  PENDING: "Chờ xử lý",
  APPROVED: "Đã phê duyệt",
  DECLINED: "Đã từ chối",
};

const STATUS_MESSAGE = {
  SYSTEM_CHECKING:
    "Hệ thống đang chạy kiểm tra tự động. Quá trình này có thể mất vài phút, vui lòng kiểm tra lại sau.",
  PENDING:
    "Đơn đăng ký của bạn đang được quản trị viên xem xét. Vui lòng chờ phản hồi.",
  APPROVED:
    "Đơn đăng ký của bạn đã được phê duyệt. Nếu vai trò Ban tổ chức chưa được cập nhật trên giao diện, vui lòng đăng xuất và đăng nhập lại.",
  DECLINED:
    "Đơn đăng ký của bạn không được phê duyệt. Bạn có thể chỉnh sửa thông tin và gửi lại đơn.",
};

const formatDate = (value) => {
  if (!value) return "--";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value || "--"}</p>
    </div>
  );
}

export function OrganizerRequestStatusCard({
  request,
  currentRole = "user",
}) {
  const normalizedRole = String(currentRole || "").toLowerCase();
  const status =
    request?.status || (normalizedRole === "organizer" ? "APPROVED" : "");

  if (!status) return null;

  const isSystemChecking = status === "SYSTEM_CHECKING";
  const isPending = status === "PENDING";
  const isApproved = status === "APPROVED";
  const isDeclined = status === "DECLINED";

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <ShieldCheck size={20} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Trạng thái Đơn đăng ký Ban tổ chức
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Theo dõi trạng thái xét duyệt đơn xin nâng cấp tài khoản của bạn.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              STATUS_STYLES[status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {STATUS_LABELS[status] || status}
          </span>
        </div>

        {/* [FIX]: Removed reviewer, kept necessary information */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <InfoBox
            label="Tổ chức"
            value={request?.organizationName || "Tài khoản Ban tổ chức"}
          />
          <InfoBox
            label="Ngày gửi"
            value={formatDate(request?.submittedAt || request?.createdAt)}
          />
          <InfoBox
            label="Ngày phản hồi"
            value={formatDate(request?.reviewedAt)}
          />
        </div>

        {isSystemChecking && (
          <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-indigo-700">
                <Info size={18} />
              </div>
              <p className="text-sm leading-6 text-indigo-800">
                {STATUS_MESSAGE.SYSTEM_CHECKING}
              </p>
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-rose-600">
                <FileWarning size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-700">Lý do từ chối</p>
                <p className="mt-2 text-sm leading-6 text-rose-600">
                  {request?.reviewReason || "Quản trị viên chưa cung cấp lý do cụ thể."}
                </p>

                <Link
                  to="/organizer/apply"
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
                >
                  Gửi lại Đơn đăng ký
                </Link>
              </div>
            </div>
          </div>
        )}

        {isPending && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-amber-700">
                <Clock3 size={18} />
              </div>
              <p className="text-sm leading-6 text-amber-800">
                {STATUS_MESSAGE.PENDING}
              </p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-emerald-700">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-sm leading-6 text-emerald-700">
                {STATUS_MESSAGE.APPROVED}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerRequestStatusCard;