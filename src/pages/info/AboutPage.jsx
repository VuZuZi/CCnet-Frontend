import React from "react";
import { useQuery } from "@tanstack/react-query";
import { HeartHandshake, ShieldCheck, Users } from "lucide-react";

import { projectAPI } from "@/features/project/api/projectAPI";
import { SupportDonationCard } from "@/features/transaction/components/SupportDonationCard";

export default function AboutPage() {
  const { data: metrics } = useQuery({
    queryKey: ["about", "landing-metrics"],
    queryFn: () => projectAPI.getLandingMetrics(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f8fbff_100%)] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="bg-amber-400 px-8 py-12 text-center">
            <h1 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Về CCNet
            </h1>
            <p className="mx-auto max-w-xl font-medium text-amber-900">
              Nền tảng kết nối những trái tim nhân ái, lan tỏa giá trị tích cực
              và kiến tạo một cộng đồng bền vững.
            </p>
          </div>

          <div className="space-y-10 p-8 leading-relaxed text-slate-600 sm:p-12">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Câu chuyện của chúng tôi
              </h2>
              <p>
                CCNet ra đời từ niềm tin giản dị: bất kỳ ai trong chúng ta cũng
                có khả năng mang lại sự thay đổi tích cực. Trong một xã hội đang
                phát triển nhanh chóng, vẫn còn đó những hoàn cảnh khó khăn cần
                được sẻ chia, những dự án cộng đồng thiếu hụt nguồn lực để triển
                khai.
              </p>
              <p className="mt-4">
                Chúng tôi xây dựng CCNet không chỉ là một nền tảng công nghệ,
                mà là một chiếc cầu nối minh bạch, an toàn và dễ sử dụng. Nơi mà
                một lời kêu gọi cần giúp đỡ có thể chạm đến hàng ngàn tấm lòng,
                và những dự án ý nghĩa có thể tìm thấy đội ngũ đồng hành phù hợp.
              </p>
            </section>

            <section>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Giá trị cốt lõi
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <ValueCard
                  icon={Users}
                  iconClass="bg-amber-100 text-amber-600"
                  title="Cộng đồng"
                  description="Sức mạnh lớn nhất đến từ sự đoàn kết của tập thể."
                />
                <ValueCard
                  icon={ShieldCheck}
                  iconClass="bg-blue-100 text-blue-600"
                  title="Minh bạch"
                  description="Mọi thông tin, đóng góp và tiến độ đều được theo dõi rõ ràng."
                />
                <ValueCard
                  icon={HeartHandshake}
                  iconClass="bg-rose-100 text-rose-600"
                  title="Đồng cảm"
                  description="Hành động từ trái tim, thấu hiểu và tôn trọng mọi cá nhân."
                />
              </div>
            </section>
          </div>
        </div>

        <SupportDonationCard
          compact
          supportBalance={Number(metrics?.webSupportFundBalance || 0)}
          title="Ủng hộ duy trì nền tảng"
          description="Nếu bạn muốn CCNet tiếp tục hoạt động ổn định, có thể dùng QR này để ủng hộ quỹ vận hành chung của web. Khoản này không thay thế quỹ của bất kỳ project nào."
        />
      </div>
    </div>
  );
}

function ValueCard({ icon: Icon, iconClass, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}
      >
        <Icon size={24} />
      </div>
      <h3 className="mb-2 font-bold text-slate-900">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}
