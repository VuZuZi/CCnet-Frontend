import { Building2, Landmark, Link2, PenLine, UserRound } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import {
  ORGANIZATION_LEGAL_TYPES,
  ORGANIZATION_TYPES,
} from "../../constants/organizerRequest.constants";

const findLabel = (items, value) =>
  items.find((item) => item.value === value)?.label || value || "Chưa cung cấp";

const displayText = (value) => value || "Chưa cung cấp";

function ReviewCard({ title, icon, step, onEditStep, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            {icon}
          </div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onEditStep(step)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <PenLine size={14} />
          Sửa
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function DocumentRow({ label, document }) {
  return (
    <Row
      label={label}
      value={
        document?.fileName || document?.originalName || document?.url
          ? document.fileName || document.originalName || "Đã tải lên"
          : "Chưa cung cấp"
      }
    />
  );
}

export function OrganizerRequestReviewStep({ values, onEditStep }) {
  const proofLinks = Array.isArray(values.proofLinks)
    ? values.proofLinks.filter(Boolean)
    : [];

  return (
    <OrganizerSectionCard
      icon={<PenLine size={18} />}
      title="Xem lại thông tin"
      iconClassName="bg-amber-100 text-amber-700"
    >
      <div className="space-y-5">
        <ReviewCard
          title="Thông tin người đại diện"
          icon={<UserRound size={18} />}
          step={1}
          onEditStep={onEditStep}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Row label="Họ và tên" value={displayText(values.fullNameSnapshot)} />
            <Row label="Email" value={displayText(values.emailSnapshot)} />
            <Row label="Số điện thoại" value={displayText(values.phoneSnapshot)} />
            <Row
              label="Địa chỉ"
              value={displayText(values.locationSnapshot?.address)}
            />
          </div>
        </ReviewCard>

        <ReviewCard
          title="Thông tin tổ chức"
          icon={<Building2 size={18} />}
          step={2}
          onEditStep={onEditStep}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Row label="Tên tổ chức" value={displayText(values.organizationName)} />
            <Row
              label="Lĩnh vực hoạt động"
              value={findLabel(ORGANIZATION_TYPES, values.organizationType)}
            />
            <Row
              label="Hình thức pháp lý"
              value={findLabel(
                ORGANIZATION_LEGAL_TYPES,
                values.organizationLegalType
              )}
            />
            <Row
              label="Trang web"
              value={displayText(values.organizationWebsite)}
            />
            <Row label="Mã số thuế" value={displayText(values.taxCode)} />
            <Row
              label="Mã đăng ký / quyết định"
              value={displayText(values.legalRegistrationNumber)}
            />
          </div>
        </ReviewCard>

        <ReviewCard
          title="Uy tín & Minh chứng hoạt động"
          icon={<Link2 size={18} />}
          step={3}
          onEditStep={onEditStep}
        >
          <div className="space-y-3">
            <Row
              label="Mô tả hoạt động"
              value={displayText(values.activityDescription)}
            />
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Liên kết minh chứng
              </p>
              {proofLinks.length ? (
                <ul className="mt-2 space-y-1">
                  {proofLinks.map((link) => (
                    <li key={link} className="truncate text-sm font-semibold">
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Chưa cung cấp
                </p>
              )}
            </div>
            <DocumentRow
              label="Giấy phép tổ chức"
              document={values.businessLicense}
            />
          </div>
        </ReviewCard>

        <ReviewCard
          title="Tài khoản ngân hàng"
          icon={<Landmark size={18} />}
          step={4}
          onEditStep={onEditStep}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Row label="Ngân hàng" value={displayText(values.bankName)} />
            <Row
              label="Số tài khoản"
              value={displayText(values.bankAccountNumber)}
            />
            <Row
              label="Tên chủ tài khoản"
              value={displayText(values.bankAccountName)}
            />
            <DocumentRow
              label="Minh chứng tài khoản"
              document={values.bankProof}
            />
          </div>
        </ReviewCard>
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestReviewStep;
