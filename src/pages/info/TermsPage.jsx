import React from "react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          Điều khoản sử dụng
        </h1>
        <p className="text-slate-500 mb-8 border-b border-slate-100 pb-8">
          Cập nhật lần cuối: Tháng 4, 2026
        </p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              1. Chấp nhận điều khoản
            </h2>
            <p>
              Bằng việc truy cập và sử dụng CCNet, bạn đồng ý tuân thủ các Điều
              khoản sử dụng này. Nền tảng được tạo ra với mục đích kết nối cộng
              đồng, hỗ trợ từ thiện và các hoạt động xã hội phi lợi nhuận.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. Nguyên tắc tính xác thực
            </h2>
            <p>
              Mọi thông tin được đăng tải trên nền tảng (bao gồm các chiến dịch
              gây quỹ, lời kêu gọi giúp đỡ) phải đảm bảo{" "}
              <strong>chính xác, trung thực và có bằng chứng rõ ràng</strong>.
              Các hành vi tạo chiến dịch giả mạo, lợi dụng lòng tin của cộng
              đồng để trục lợi cá nhân sẽ bị khóa tài khoản vĩnh viễn và có thể
              bị báo cáo cho các cơ quan chức năng có thẩm quyền.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. Quyền và trách nhiệm của người tổ chức
            </h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Cam kết sử dụng nguồn quỹ và vật phẩm quyên góp đúng mục đích đã
                cam kết ban đầu.
              </li>
              <li>
                Có trách nhiệm cập nhật tiến độ, minh bạch thu chi và hình ảnh
                thực tế của dự án cho cộng đồng.
              </li>
              <li>
                Chịu trách nhiệm hoàn toàn trước pháp luật về tính hợp pháp của
                dự án.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Miễn trừ trách nhiệm
            </h2>
            <p>
              CCNet đóng vai trò là nền tảng công nghệ kết nối. Dù chúng tôi nỗ
              lực hết sức trong việc xác thực (verify) các tổ chức và cá nhân,
              chúng tôi không bảo đảm tuyệt đối 100% rủi ro từ các giao dịch
              giữa người dùng. Vui lòng tìm hiểu kỹ trước khi quyết định quyên
              góp hoặc tham gia tình nguyện.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
