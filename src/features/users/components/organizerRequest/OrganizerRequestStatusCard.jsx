import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, FileWarning, ShieldCheck } from "lucide-react";

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS = {
  PENDING: "Đang chờ duyệt",
  APPROVED: "Đã được duyệt",
  DECLINED: "Đã bị từ chối",
};

const STATUS_MESSAGE = {
  PENDING:
    "Hồ sơ của bạn đang được admin xem xét. Vui lòng chờ phản hồi.",
  APPROVED:
    "Hồ sơ của bạn đã được duyệt. Nếu quyền Organizer chưa cập nhật ngay trên giao diện, hãy đăng xuất và đăng nhập lại.",
  DECLINED:
    "Hồ sơ của bạn chưa được duyệt. Bạn có thể chỉnh sửa lại thông tin và gửi lại hồ sơ.",
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

  if (!status) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldCheck size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Bạn chưa có hồ sơ Organizer
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Hãy gửi hồ sơ để admin xét duyệt nâng cấp tài khoản của bạn lên
              Organizer.
            </p>

            <Link
              to="/organizer/apply"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300"
            >
              Gửi hồ sơ ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Trạng thái hồ sơ Organizer
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Theo dõi kết quả xét duyệt hồ sơ nâng cấp tài khoản của bạn.
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

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoBox
            label="Tổ chức"
            value={request?.organizationName || "Organizer account"}
          />
          <InfoBox
            label="Ngày nộp"
            value={formatDate(request?.submittedAt || request?.createdAt)}
          />
          <InfoBox
            label="Ngày phản hồi"
            value={formatDate(request?.reviewedAt)}
          />
          <InfoBox
            label="Người duyệt"
            value={request?.reviewedBy?.fullName || "--"}
          />
        </div>

        {isDeclined ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-rose-600">
                <FileWarning size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-700">Lý do từ chối</p>
                <p className="mt-2 text-sm leading-6 text-rose-600">
                  {request?.reviewReason || "Admin chưa cung cấp lý do cụ thể."}
                </p>

                <Link
                  to="/organizer/apply"
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
                >
                  Gửi lại hồ sơ
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {isPending ? (
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
        ) : null}

        {isApproved ? (
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
        ) : null}
      </div>
    </div>
  );
}

export default OrganizerRequestStatusCard;