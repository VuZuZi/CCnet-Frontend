import DOMPurify from "dompurify";
import { AlertTriangle } from "lucide-react";
import ReviewSection from "./ReviewSection";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { DECISION_LABELS } from "./projectReview.constants";

const money = (value) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const emptyText = (value) => {
  if (value == null || value === "") return "Chưa có dữ liệu";
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.length ? value.join(", ") : "Chưa có dữ liệu";
    return "Có dữ liệu cấu trúc";
  }
  return String(value);
};

function SafeEvidencePolicy({ policy }) {
  if (!policy) return <span>Chưa có dữ liệu</span>;
  if (typeof policy === "string") return <span>{policy}</span>;
  if (typeof policy === "object") {
    const items = [];
    if ("requireFinancial" in policy) {
      items.push(`Chứng từ tài chính: ${policy.requireFinancial ? "Có" : "Không"}`);
    }
    if ("requireGeoPhotos" in policy) {
      items.push(`Ảnh có vị trí: ${policy.requireGeoPhotos ? "Có" : "Không"}`);
    }
    if ("requireVolunteerLogs" in policy) {
      items.push(`Nhật ký tình nguyện viên: ${policy.requireVolunteerLogs ? "Có" : "Không"}`);
    }
    if (items.length > 0) {
      return (
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          {items.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      );
    }
    return <span>Có dữ liệu cấu trúc</span>;
  }
  return <span>{String(policy)}</span>;
}

/* ── Safe HTML rendering ─────────────────────────────────── */

function SafeHtml({ html, className = "" }) {
  if (!html) return <p className="text-sm text-slate-500">Chưa có dữ liệu</p>;

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "a", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <div
      className={`prose prose-slate max-w-none text-sm leading-7 text-slate-700 [&_*]:max-w-full [&_*]:break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

/* ── Delivery/handover signal heuristic ──────────────────── */

const DELIVERY_SIGNAL_PATTERNS = [
  /bàn giao/i,
  /phân phối/i,
  /giao hàng/i,
  /chuyển giao/i,
  /trao tặng/i,
  /phát quà/i,
  /phát tặng/i,
  /trao quà/i,
  /phân bổ/i,
  /deliver/i,
  /handover/i,
  /hand-over/i,
  /hand over/i,
  /distribut/i,
  /transfer/i,
  /bằng chứng/i,
  /evidence/i,
  /xác minh/i,
  /xác nhận/i,
  /kiểm tra/i,
  /nghiệm thu/i,
  /biên bản/i,
  /receipt/i,
  /verif/i,
];

function hasDeliverySignal(milestone) {
  const textFields = [
    milestone.title,
    milestone.description,
    milestone.deliverables,
    typeof milestone.evidencePolicy === "string" ? milestone.evidencePolicy : JSON.stringify(milestone.evidencePolicy || {}),
  ].filter(Boolean);

  return textFields.some((text) =>
    DELIVERY_SIGNAL_PATTERNS.some((pattern) => pattern.test(String(text)))
  );
}

/* ── Project Summary ─────────────────────────────────────── */

export function ProjectSummaryReviewSection({ project, findings, sectionSeverity }) {
  return (
    <ReviewSection id="project_summary" title="Tổng quan dự án" findings={findings} severity={sectionSeverity}>
      <SafeHtml html={project?.description} />
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Loại dự án" value={emptyText(project?.projectType)} />
        <Info label="Danh mục" value={emptyText(project?.category)} />
        <Info label="Mục tiêu" value={money(project?.targetAmount)} />
      </div>
    </ReviewSection>
  );
}

/* ── Beneficiary ─────────────────────────────────────────── */

export function BeneficiaryReviewSection({ project, findings, sectionSeverity }) {
  const beneficiary = project?.beneficiaryInfo || {};
  return (
    <ReviewSection id="beneficiary" title="Người thụ hưởng" findings={findings} severity={sectionSeverity}>
      <SafeHtml html={beneficiary.details} />
      <div className="grid gap-3 md:grid-cols-2">
        <Info label="Số người thụ hưởng" value={emptyText(beneficiary.totalBeneficiaries)} />
        <Info label="Cách xác nhận" value={emptyText(beneficiary.evidenceMethod)} />
      </div>
    </ReviewSection>
  );
}

/* ── Budget ───────────────────────────────────────────────── */

export function BudgetReviewSection({ project, findings, sectionSeverity }) {
  const milestones = Array.isArray(project?.milestones) ? project.milestones : [];
  const targetAmount = Number(project?.targetAmount || 0);
  const totalMilestoneBudget = milestones.reduce(
    (sum, m) => sum + Number(m.targetAmount || 0),
    0
  );
  const hasMismatch =
    milestones.length > 0 && targetAmount > 0 && totalMilestoneBudget !== targetAmount;

  return (
    <ReviewSection id="budget" title="Ngân sách và cách sử dụng tiền" findings={findings} severity={sectionSeverity}>
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Mục tiêu gây quỹ" value={targetAmount > 0 ? money(targetAmount) : "Cần kiểm tra"} />
        <Info
          label="Tổng ngân sách milestone"
          value={milestones.length > 0 ? money(totalMilestoneBudget) : "Cần kiểm tra"}
        />
        <Info label="Chính sách dư quỹ" value={emptyText(project?.surplusPolicy)} />
      </div>
      {hasMismatch && (
        <div className="mt-3 flex gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            Tổng milestone ({money(totalMilestoneBudget)}) khác mục tiêu gây quỹ ({money(targetAmount)}).
            Quản trị viên nên kiểm tra lại.
          </p>
        </div>
      )}
    </ReviewSection>
  );
}

/* ── Milestones ───────────────────────────────────────────── */

export function MilestoneLogicReviewSection({ project, findings, sectionSeverity, findingsByTarget }) {
  const milestones = Array.isArray(project?.milestones) ? project.milestones : [];

  const hasMoneyMilestone = milestones.some((m) => Number(m.targetAmount || 0) > 0);
  const hasDeliveryMilestone = milestones.some((m) => hasDeliverySignal(m));
  const showDeliveryWarning = hasMoneyMilestone && !hasDeliveryMilestone;

  return (
    <ReviewSection id="milestones" title="Logic các mốc thực hiện" findings={findings} severity={sectionSeverity}>
      {milestones.length ? (
        <div className="space-y-3">
          {milestones.map((item, index) => {
            const amount = Number(item.targetAmount || 0);
            const isMoney = amount > 0;
            const targetFindings = findingsByTarget?.[item.milestoneId] || [];
            const hasCritical = targetFindings.some((f) => f.severity === "critical");
            const hasWarning = targetFindings.some((f) => f.severity === "needs_review" || f.severity === "warning");
            
            const highlightClasses = hasCritical
              ? "border-red-300 bg-red-50"
              : hasWarning
              ? "border-amber-300 bg-amber-50/50"
              : "border-slate-200";

            return (
              <div
                key={item.milestoneId || index}
                className={`rounded-xl border p-4 transition-colors ${highlightClasses}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900">
                    {index + 1}. {item.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isMoney
                          ? "border border-amber-200 bg-amber-50 text-amber-800"
                          : "border border-blue-200 bg-blue-50 text-blue-700"
                      }`}
                    >
                      {isMoney ? "Mốc sử dụng ngân sách" : "Mốc hành động / bàn giao 0đ"}
                    </span>
                    <span className="text-sm font-bold text-amber-700">
                      {money(amount)}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {emptyText(item.description)}
                </p>
                {item.deliverables && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Sản phẩm bàn giao: {emptyText(item.deliverables)}
                  </p>
                )}
                {(item.startDate || item.endDate) && (
                  <p className="mt-1 text-xs text-slate-500">
                    Thời gian:{" "}
                    {item.startDate
                      ? new Date(item.startDate).toLocaleDateString("vi-VN")
                      : "?"}{" "}
                    →{" "}
                    {item.endDate
                      ? new Date(item.endDate).toLocaleDateString("vi-VN")
                      : "?"}
                  </p>
                )}
                {item.evidencePolicy && (
                  <div className="mt-1 text-xs text-slate-500">
                    <span className="font-semibold">Chính sách bằng chứng: </span>
                    <SafeEvidencePolicy policy={item.evidencePolicy} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Chưa có dữ liệu</p>
      )}

      {showDeliveryWarning && (
        <div className="mt-3 flex gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            Có mốc sử dụng ngân sách nhưng chưa thấy tín hiệu bàn giao, phân phối hoặc
            bằng chứng nghiệm thu trong tiêu đề, mô tả, sản phẩm bàn giao hoặc chính sách
            bằng chứng của bất kỳ mốc nào. Quản trị viên nên kiểm tra thêm.
          </p>
        </div>
      )}
    </ReviewSection>
  );
}

/* ── Evidence / Documents ─────────────────────────────────── */

export function EvidenceReviewSection({ project, findings, sectionSeverity, onPreviewFile }) {
  const documents = Array.isArray(project?.documents) ? project.documents : [];
  const media = Array.isArray(project?.media) ? project.media : [];

  return (
    <ReviewSection
      id="evidence"
      title="Tài liệu, hình ảnh và bằng chứng"
      findings={findings}
      severity={sectionSeverity}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Info
          label="Ảnh bìa"
          value={project?.coverMedia?.url ? "Có ảnh bìa" : "Chưa có dữ liệu"}
        />
        <Info label="Tài liệu" value={`${documents.length} tài liệu`} />
        <Info label="Hình ảnh / media" value={`${media.length} tệp`} />
      </div>
      {documents.length ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <button
              key={doc._id || doc.url}
              type="button"
              onClick={() => onPreviewFile?.(doc)}
              className="block w-full rounded-xl border border-slate-200 p-3 text-left text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              {doc.originalName || doc.publicId || "Tài liệu"}
            </button>
          ))}
        </div>
      ) : null}
      {media.length ? (
        <div className="grid gap-2 md:grid-cols-4">
          {media.slice(0, 8).map((item) => (
            <button
              key={item._id || item.url}
              type="button"
              onClick={() => onPreviewFile?.(item)}
              className="overflow-hidden rounded-xl border border-slate-200 transition hover:border-amber-300"
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.originalName || "Media"}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-slate-50 text-xs text-slate-500">
                  {item.originalName || "Media"}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </ReviewSection>
  );
}

/* ── Timeline / Location ──────────────────────────────────── */

export function TimelineLocationReviewSection({ project, findings, sectionSeverity }) {
  return (
    <ReviewSection id="timeline" title="Thời gian và địa điểm" findings={findings} severity={sectionSeverity}>
      <div className="grid gap-3 md:grid-cols-3">
        <Info
          label="Ngày bắt đầu"
          value={
            project?.startDate
              ? new Date(project.startDate).toLocaleDateString("vi-VN")
              : "Chưa có dữ liệu"
          }
        />
        <Info
          label="Ngày kết thúc"
          value={
            project?.endDate
              ? new Date(project.endDate).toLocaleDateString("vi-VN")
              : "Chưa có dữ liệu"
          }
        />
        <Info label="Địa điểm" value={emptyText(project?.location?.address)} />
      </div>
    </ReviewSection>
  );
}

/* ── Organizer Trust ──────────────────────────────────────── */

export function OrganizerTrustReviewSection({ organizerTrust, findings, sectionSeverity }) {
  const priorHistory = organizerTrust?.priorProjectHistory || {};
  const historyUnavailable = priorHistory?.unavailable;

  return (
    <ReviewSection id="organizer" title="Bối cảnh tin cậy của tổ chức" findings={findings} severity={sectionSeverity}>
      <div className="grid gap-3 md:grid-cols-2">
        <Info
          label="KYC"
          value={
            organizerTrust?.kyc?.unavailable
              ? "Chưa có dữ liệu"
              : `${organizerTrust?.kyc?.status || "Chưa có dữ liệu"} - Tier ${organizerTrust?.kyc?.tier ?? 0}`
          }
        />
        <Info
          label="Cam kết trách nhiệm"
          value={
            organizerTrust?.responsibilityAgreement?.unavailable
              ? "Chưa có dữ liệu"
              : organizerTrust?.responsibilityAgreement?.status
          }
        />
        <Info
          label="Dự án đã công khai/thực hiện"
          value={
            historyUnavailable
              ? "Chưa có dữ liệu"
              : `${priorHistory.meaningfulProjectHistory || 0} dự án`
          }
        />
        <Info
          label="Hồ sơ organizer"
          value={
            organizerTrust?.organizerProfile?.unavailable
              ? "Chưa có dữ liệu"
              : organizerTrust?.organizerProfile?.fullName
          }
        />
      </div>
      {!historyUnavailable && (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Info
            label="Dự án bị từ chối"
            value={`${priorHistory.rejectedProjects || 0}`}
          />
          <Info
            label="Dự án yêu cầu sửa"
            value={`${priorHistory.revisionRequestedProjects || 0}`}
          />
          <Info
            label="Dự án bị hủy"
            value={`${priorHistory.cancelledProjects || 0}`}
          />
        </div>
      )}
    </ReviewSection>
  );
}

/* ── Review History ───────────────────────────────────────── */

export function ReviewHistorySection({ records = [] }) {
  return (
    <ReviewSection id="policy" title="Lịch sử kiểm duyệt">
      {records.length ? (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record._id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    record.decision === "APPROVED"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : record.decision === "REJECTED"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {DECISION_LABELS[record.decision] || record.decision}
                </span>
                {record.transitionAttemptedAt && (
                  <span className="text-xs text-slate-500">
                    {new Date(record.transitionAttemptedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <p className="mt-1 text-slate-600">
                {record.feedback || record.reason || "Không có ghi chú"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Chưa có dữ liệu</p>
      )}
    </ReviewSection>
  );
}

/* ── Reusable Info card ───────────────────────────────────── */

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
