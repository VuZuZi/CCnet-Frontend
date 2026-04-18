import React from "react";
import { HeartHandshake, ShieldCheck, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner */}
        <div className="bg-amber-400 px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Về CCNet
          </h1>
          <p className="text-amber-900 font-medium max-w-xl mx-auto">
            Nền tảng kết nối những trái tim nhân ái, lan tỏa giá trị tích cực và
            kiến tạo một cộng đồng bền vững.
          </p>
        </div>

        {/* Nội dung */}
        <div className="p-8 sm:p-12 space-y-10 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Câu chuyện của chúng tôi
            </h2>
            <p>
              CCNet ra đời từ niềm tin giản dị: Bất kỳ ai trong chúng ta cũng có
              khả năng mang lại sự thay đổi tích cực. Trong một xã hội đang phát
              triển nhanh chóng, vẫn còn đó những hoàn cảnh khó khăn cần được sẻ
              chia, những dự án cộng đồng thiếu hụt nguồn lực để triển khai.
            </p>
            <p className="mt-4">
              Chúng tôi xây dựng CCNet không chỉ là một nền tảng công nghệ, mà
              là một "chiếc cầu nối" minh bạch, an toàn và dễ sử dụng. Nơi mà
              một lời kêu gọi "Cần giúp đỡ" có thể nhanh chóng chạm đến hàng
              ngàn tấm lòng, và những "Dự án" ý nghĩa có thể tìm thấy những tình
              nguyện viên nhiệt huyết nhất.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Giá trị cốt lõi
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Cộng đồng</h3>
                <p className="text-sm">
                  Sức mạnh lớn nhất đến từ sự đoàn kết của tập thể.
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Minh bạch</h3>
                <p className="text-sm">
                  Mọi thông tin, đóng góp đều được công khai rõ ràng.
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HeartHandshake size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Đồng cảm</h3>
                <p className="text-sm">
                  Hành động từ trái tim, thấu hiểu và tôn trọng mọi cá nhân.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
