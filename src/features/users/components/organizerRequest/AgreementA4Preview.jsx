export const ORGANIZER_AGREEMENT_TEMPLATE_V2_1 = {
  version: "2.1",
  language: "vi",
  title: "Cam kết trách nhiệm — Đăng ký Ban tổ chức trên CCNet",
  sections: [
    {
      code: "TRUTHFUL_INFO",
      title: "Điều 1. Cam kết về tính trung thực của thông tin",
      body: "Tôi xác nhận mọi thông tin cá nhân, thông tin tổ chức và tài liệu trong hồ sơ đăng ký này là trung thực, chính xác và đầy đủ. Tôi chịu trách nhiệm về tính xác thực của toàn bộ nội dung đã cung cấp và sẵn sàng giải trình khi được yêu cầu.",
    },
    {
      code: "REPRESENTATION",
      title: "Điều 2. Cam kết về tư cách đại diện và hoạt động tổ chức/nhóm",
      body: "Tôi cam kết chỉ sử dụng tài khoản Ban tổ chức để đại diện đúng tổ chức hoặc nhóm đã khai báo. Tôi không mạo danh, không sử dụng danh nghĩa tổ chức khác, và đảm bảo hoạt động đúng phạm vi đã đăng ký trên nền tảng CCNet.",
    },
    {
      code: "PROPER_USE",
      title: "Điều 3. Cam kết sử dụng nền tảng đúng mục đích",
      body: "Tôi cam kết sử dụng nền tảng CCNet đúng mục đích từ thiện, cộng đồng hoặc xã hội như đã khai báo. Tôi không sử dụng nền tảng cho mục đích thương mại cá nhân, gian lận, hoặc bất kỳ hoạt động nào vi phạm quy định của nền tảng.",
    },
    {
      code: "FINANCIAL_USE",
      title: "Điều 4. Cam kết sử dụng nguồn tiền gây quỹ đúng nội dung công bố",
      body: "Tôi cam kết sử dụng toàn bộ tiền, hiện vật hoặc nguồn lực được ủng hộ thông qua nền tảng đúng mục đích đã công bố trong từng dự án. Mọi khoản chi phải minh bạch, có bằng chứng và phù hợp với nội dung đã cam kết với người ủng hộ.",
    },
    {
      code: "PROGRESS_REPORTING",
      title: "Điều 5. Cam kết cập nhật tiến độ, minh chứng và báo cáo",
      body: "Tôi cam kết cập nhật tiến độ dự án, cung cấp bằng chứng hoạt động và nộp báo cáo minh bạch theo đúng quy định và thời hạn của nền tảng CCNet.",
    },
    {
      code: "COOPERATION",
      title: "Điều 6. Cam kết phối hợp với CCNet khi cần xem xét bổ sung",
      body: "Tôi đồng ý phối hợp đầy đủ với đội ngũ CCNet trong quá trình xem xét hồ sơ, kiểm tra hoạt động hoặc giải quyết khiếu nại. Tôi chấp nhận việc CCNet có quyền tạm dừng hoặc thu hồi quyền Ban tổ chức nếu phát hiện vi phạm.",
    },
    {
      code: "ACCOUNTABILITY",
      title: "Điều 7. Cam kết chịu trách nhiệm khi cung cấp sai thông tin hoặc vi phạm nghĩa vụ",
      body: "Tôi hiểu và chấp nhận rằng nếu cung cấp thông tin sai lệch, sử dụng nguồn lực sai mục đích, hoặc vi phạm bất kỳ điều khoản nào trong bản cam kết này, CCNet có quyền xử lý theo quy trình nội bộ bao gồm tạm dừng, thu hồi vai trò Ban tổ chức, và thông báo cho các bên liên quan.",
    },
  ],
};

export const ALL_AGREEMENT_CODES = ORGANIZER_AGREEMENT_TEMPLATE_V2_1.sections.map(
  (section) => section.code
);

const formatDateTime = (value) => {
  if (!value) return "Chưa ghi nhận";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa ghi nhận";
  return date.toLocaleString("vi-VN");
};

const truncateHash = (hash) => {
  if (!hash) return "";
  if (hash.length <= 24) return hash;
  return `${hash.slice(0, 12)}...${hash.slice(-8)}`;
};

export function AgreementA4Preview({
  contentSnapshot,
  signatureSnapshot,
  signerName = "",
  signedAt = null,
  version = "2.1",
  integrityHash = "",
  isSealed = null,
  sealedAt = null,
}) {
  const content = contentSnapshot?.sections?.length
    ? contentSnapshot
    : ORGANIZER_AGREEMENT_TEMPLATE_V2_1;
  const signatureImageDataUrl = signatureSnapshot?.signatureImageDataUrl || "";
  const displaySignerName =
    signatureSnapshot?.signerName || signerName || "Chưa nhập tên người ký";
  const displaySignedAt = signatureSnapshot?.signedAt || signedAt;
  const displayVersion = content.version || version || "2.1";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-5">
      <article className="mx-auto min-h-[920px] max-w-[820px] rounded-xl border border-slate-200 bg-white px-6 py-8 text-slate-900 shadow-sm sm:px-10 sm:py-12">
        <header className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            CCNet
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
            {content.title}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Phiên bản {displayVersion}
          </p>
        </header>

        <div className="mt-8 space-y-5">
          {(content.sections || []).map((section) => (
            <section key={section.code} className="space-y-2">
              <h3 className="text-base font-bold leading-6 text-slate-950">
                {section.title}
              </h3>
              <p className="text-sm leading-7 text-slate-700">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-10 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Người ký xác nhận
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">
              {displaySignerName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Thời gian: {formatDateTime(displaySignedAt)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Chữ ký xác nhận trên nền tảng
            </p>
            {signatureImageDataUrl ? (
              <img
                src={signatureImageDataUrl}
                alt="Chữ ký xác nhận"
                className="mt-3 h-24 w-full rounded-lg border border-slate-200 bg-white object-contain"
              />
            ) : (
              <p className="mt-3 text-sm font-medium text-slate-500">
                Hồ sơ chưa có ảnh chữ ký vẽ tay theo phiên bản 2.1.
              </p>
            )}
          </div>
        </div>

        {(integrityHash || isSealed !== null || sealedAt) && (
          <div className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
            {integrityHash ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Mã kiểm tra toàn vẹn
                </p>
                <p
                  className="mt-1 break-all font-mono text-xs text-slate-700"
                  title={integrityHash}
                >
                  {truncateHash(integrityHash)}
                </p>
              </div>
            ) : null}
            {isSealed !== null || sealedAt ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Trạng thái niêm phong
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {isSealed ? "Đã niêm phong" : "Chưa niêm phong"}
                </p>
                {sealedAt ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(sealedAt)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium leading-6 text-amber-900">
          Bản ghi cam kết nội bộ trên nền tảng, chưa thay thế hồ sơ pháp lý hoặc chứng thực chính thức.
        </p>
      </article>
    </div>
  );
}

export default AgreementA4Preview;
