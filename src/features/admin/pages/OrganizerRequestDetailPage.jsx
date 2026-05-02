import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import OrganizerRequestStatusBadge from "../components/organizerRequest/OrganizerRequestStatusBadge";
import OrganizerDocumentList from "../components/organizerRequest/OrganizerDocumentList";
import OrganizerReviewActions from "../components/organizerRequest/OrganizerReviewActions";
import { useOrganizerRequestDetail } from "../hooks/useOrganizerRequestDetail";

function InfoBox({ label, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}

const AGREEMENT_LABELS = {
  TRUTHFUL_INFORMATION: "Tôi xác nhận mọi thông tin trong hồ sơ là trung thực, đầy đủ và có thể giải trình khi được yêu cầu.",
  TERMS: "Tôi cam kết chỉ sử dụng hồ sơ này để đại diện đúng tổ chức hoặc nhóm đã khai báo trên CCNet.",
  FINANCIAL_RESPONSIBILITY: "Tôi cam kết sử dụng tiền, hiện vật hoặc nguồn lực được ủng hộ đúng mục đích đã công bố.",
  TRANSPARENCY_REPORTING: "Tôi cam kết cập nhật tiến độ, bằng chứng và báo cáo minh bạch theo quy định của nền tảng.",
  PLATFORM_ENFORCEMENT: "Tôi chấp nhận việc CCNet kiểm tra, tạm dừng hoặc xử lý hồ sơ nếu phát hiện thông tin sai lệch hoặc sử dụng sai mục đích."
};

function getSafeTextDisplay(text) {
  if (!text || typeof text !== "string") return text;
  if (text.startsWith("Invalid input: expected string") || text.includes("Invalid input: expected string")) {
    return "Dữ liệu mô tả không hợp lệ, cần yêu cầu người nộp cập nhật.";
  }
  return text;
}

export function OrganizerRequestDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { request, isLoading, approve, decline, isApproving, isDeclining } =
    useOrganizerRequestDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-r-transparent" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-slate-500">Không tìm thấy yêu cầu từ ban tổ chức.</p>
      </div>
    );
  }

  const hasRiskFlag =
    request.riskFlags?.includes("CROSS_LINKED_BANK") ||
    request.notes?.includes("[SYSTEM FLAG]");

  const hasManualReview = request.ekycMetadata?.verificationStatus === "MANUAL_REVIEW";
  const resubmissionCount = Number(request.resubmissionCount) || 0;
  const hasCommitment = Boolean(request.agreements || request.signatureHash || request.isAccepted || request.commitment);
  const hasBankInfo = Boolean(request.bankAccountNumber && request.bankName);
  
  const currentName = request.userId?.fullName;
  const isNameChanged =
    Boolean(currentName) && currentName !== request.fullNameSnapshot;

  const isApproved = request.status === "APPROVED";

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/organizers")}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
              >
                <ArrowLeft size={16} />
                Quay lại Yêu cầu Ban tổ chức
              </button>
            </div>

            <h1 className="text-[30px] font-black leading-none tracking-tight text-slate-900">
              Chi tiết Yêu cầu Ban tổ chức
            </h1>
            <p className="mt-2 text-sm text-slate-500">Mã: {request._id}</p>

            {isApproved && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} />
                Yêu cầu đã được phê duyệt — người dùng đã được cấp vai trò Ban tổ chức (KYC Bậc 1).
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">
            Tổng quan đánh giá
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Trạng thái hồ sơ
              </p>
              <div className="mt-1.5">
                <OrganizerRequestStatusBadge status={request.status} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Cảnh báo hệ thống
              </p>
              <div className="mt-1.5">
                {hasRiskFlag ? (
                  <span className="inline-flex font-medium text-sm text-rose-600">Có cảnh báo cần kiểm tra</span>
                ) : (
                  <span className="inline-flex font-medium text-sm text-slate-600">Chưa có cảnh báo hệ thống hiển thị</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Định danh
              </p>
              <div className="mt-1.5">
                {hasManualReview ? (
                  <span className="inline-flex font-medium text-sm text-amber-600">Cần xem xét thủ công</span>
                ) : (
                  <span className="inline-flex font-medium text-sm text-slate-600">Chưa có xác minh tự động</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Lịch sử nộp
              </p>
              <div className="mt-1.5">
                {resubmissionCount > 0 ? (
                  <span className="inline-flex font-medium text-sm text-amber-600">Đã nộp lại {resubmissionCount} lần</span>
                ) : (
                  <span className="inline-flex font-medium text-sm text-slate-600">Nộp lần đầu</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Cam kết
              </p>
              <div className="mt-1.5">
                {hasCommitment ? (
                  <span className="inline-flex font-medium text-sm text-slate-600">Đã ghi nhận cam kết trách nhiệm</span>
                ) : (
                  <span className="inline-flex font-medium text-sm text-amber-600">Chưa có cam kết điện tử</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Ngân hàng
              </p>
              <div className="mt-1.5">
                {hasBankInfo ? (
                  <span className="inline-flex font-medium text-sm text-amber-700">Đã cung cấp thông tin ngân hàng — cần đối chiếu</span>
                ) : (
                  <span className="inline-flex font-medium text-sm text-amber-600">Thiếu thông tin ngân hàng</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-start gap-6 xl:flex-row">
        <div className="flex w-full flex-col gap-6 xl:w-3/5">
          {hasRiskFlag && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-5 shadow-sm">
              <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={24} />
              <div>
                <h3 className="text-lg font-bold text-rose-800">
                  Cảnh báo Rủi ro
                </h3>
                <p className="mt-1 text-sm text-rose-700">
                  {request.notes?.includes("[SYSTEM FLAG]")
                    ? request.notes
                    : "Hệ thống phát hiện Số tài khoản ngân hàng này bị trùng lặp với người dùng khác. Vui lòng kiểm tra chéo tài liệu một cách cẩn thận."}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* 1. Applicant */}
            <div className="mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-slate-900">
                1. Thông tin Định danh (Ảnh chụp)
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBox label="Người nộp đơn">
                <p className="text-sm font-semibold text-slate-900">
                  {request.fullNameSnapshot}
                </p>

                {isNameChanged && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                    <Info size={14} />
                    Tên hiện tại: {currentName}
                  </div>
                )}
              </InfoBox>

              <InfoBox label="Liên hệ">
                <p className="text-sm font-semibold text-slate-900">
                  {request.emailSnapshot}
                </p>
                <p className="text-sm text-slate-600">
                  {request.phoneSnapshot || "Không cung cấp số điện thoại"}
                </p>
              </InfoBox>
            </div>

            {/* 2. Organization */}
            <div className="mb-4 mt-6 border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-slate-900">
                2. Thông tin Tổ chức
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBox label="Tên Tổ chức">
                <p className="text-sm font-semibold text-slate-900">
                  {request.organizationName}
                </p>
              </InfoBox>

              <InfoBox label="Loại hình & Trang web">
                <p className="text-sm font-semibold text-slate-900">
                  {request.organizationType}
                </p>
                <p className="truncate text-sm text-blue-600">
                  {request.organizationWebsite || "Không có"}
                </p>
              </InfoBox>
              
              {(request.taxCode || request.legalRegistrationNumber) && (
                <InfoBox label="Mã số / Giấy phép">
                  <p className="text-sm font-semibold text-slate-900">
                    {request.taxCode || request.legalRegistrationNumber}
                  </p>
                </InfoBox>
              )}
            </div>
            
            {(request.activityDescription) && (
              <div className="mt-4">
                <InfoBox label="Mô tả Hoạt động">
                  <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">
                    {getSafeTextDisplay(request.activityDescription)}
                  </p>
                </InfoBox>
              </div>
            )}

            {/* 3. Bank */}
            <div className="mb-4 mt-6 border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-slate-900">
                3. Thông tin Ngân hàng
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBox label="Tài khoản Nhận">
                <p className="text-sm font-semibold text-slate-900">
                  {request.bankAccountNumber}
                </p>
                <p className="text-sm text-slate-600">{request.bankName}</p>
              </InfoBox>

              <InfoBox label="Chủ tài khoản">
                <p className="text-sm font-semibold text-slate-900">
                  {request.bankAccountName}
                </p>
              </InfoBox>
            </div>
            
            {/* 4. Commitment */}
            <div className="mb-4 mt-6 border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-slate-900">
                4. Thông tin Cam kết
              </h2>
            </div>
            
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              {hasCommitment ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <CheckCircle2 size={16} />
                    <span>
                      Đã ký cam kết điện tử (Phiên bản {request.commitment?.version || "1.0"})
                    </span>
                  </div>

                  {request.commitment?.agreements && Array.isArray(request.commitment.agreements) && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Nội dung đã xác nhận
                      </p>
                      <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-700">
                        {request.commitment.agreements.map((agreementKey) => (
                          <li key={agreementKey}>
                            {AGREEMENT_LABELS[agreementKey] || agreementKey}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Người đại diện ký
                      </p>
                      <p className="mt-1 font-semibold text-slate-900 text-sm">
                        {request.commitment?.signerName || request.fullNameSnapshot}
                      </p>
                    </div>

                    {(request.commitment?.signatureHash || request.signatureHash) && (
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Mã chữ ký (Hash)
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-600 truncate" title={request.commitment?.signatureHash || request.signatureHash}>
                          {(request.commitment?.signatureHash || request.signatureHash).substring(0, 16)}...
                        </p>
                      </div>
                    )}
                    
                    {request.commitment?.signedAt && (
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Thời gian ký
                        </p>
                        <p className="mt-1 text-sm text-slate-900 font-medium">
                          {new Date(request.commitment.signedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {(!request.commitment?.version || request.commitment.version === "1.0") && (
                    <p className="text-xs text-slate-500 mt-2 italic">
                      Lưu ý: Đây là hồ sơ sử dụng cam kết phiên bản cũ (v1).
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Chưa có thông tin cam kết điện tử trong hồ sơ này.
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    Người dùng chưa hoàn thành bước ký cam kết hoặc hồ sơ được nộp trước khi hệ thống yêu cầu cam kết.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <OrganizerReviewActions
                status={request.status}
                onApprove={approve}
                onDecline={decline}
                isApproving={isApproving}
                isDeclining={isDeclining}
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 xl:w-2/5">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Tài liệu Đính kèm
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                Cần kiểm tra kỹ lưỡng
              </span>
            </div>

            <OrganizerDocumentList request={request} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerRequestDetailPage;