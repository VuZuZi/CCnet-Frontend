import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          Chính sách bảo mật
        </h1>
        <p className="text-slate-500 mb-8 border-b border-slate-100 pb-8">
          Sự riêng tư của bạn là ưu tiên hàng đầu tại CCNet.
        </p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              1. Thu thập thông tin
            </h2>
            <p>
              Chúng tôi thu thập các thông tin cần thiết để tối ưu hóa trải
              nghiệm của bạn trên nền tảng, bao gồm:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Thông tin cá nhân: Họ tên, Email, số điện thoại (nếu có).</li>
              <li>
                Thông tin hoạt động: Lịch sử tương tác, bình luận, và các dự án
                bạn đã lưu hoặc chia sẻ.
              </li>
              <li>
                Dữ liệu từ bên thứ ba: Nếu bạn chọn đăng nhập bằng Google hoặc
                Facebook, chúng tôi sẽ nhận được thông tin cơ bản từ hồ sơ công
                khai của bạn.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. Sử dụng thông tin
            </h2>
            <p>Thông tin của bạn được sử dụng để:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Duy trì và cung cấp các tính năng của CCNet (nhắn tin, đăng bài,
                thông báo).
              </li>
              <li>
                Kết nối bạn với các dự án cộng đồng hoặc những người đang cần
                giúp đỡ dựa trên sự quan tâm của bạn.
              </li>
              <li>
                Xác thực danh tính nhằm xây dựng một cộng đồng an toàn, chống
                lừa đảo.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. Chia sẻ dữ liệu
            </h2>
            <p>
              <strong>
                Chúng tôi tuyệt đối không bán dữ liệu cá nhân của bạn cho bên
                thứ ba.
              </strong>{" "}
              Thông tin của bạn chỉ được chia sẻ trong các trường hợp thật sự
              cần thiết:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Cho các đối tác cổng thanh toán (để xử lý giao dịch quyên góp
                một cách bảo mật).
              </li>
              <li>
                Khi có yêu cầu hợp pháp từ cơ quan chức năng nhằm phục vụ điều
                tra.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Quyền của bạn
            </h2>
            <p>
              Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa toàn bộ dữ liệu
              cá nhân của mình khỏi hệ thống CCNet bất kỳ lúc nào thông qua phần
              "Cài đặt tài khoản".
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
