import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button';
import { ProjectCard } from '@/features/landing/components/ProjectCard';
import { impactJourneys, mockProjects, transparencyPromises } from '@/features/landing/data/landing.data';

export function LandingPage() {
  return (
    <div className="pt-20"> {/* Padding top để bù lại Fixed Navbar */}
      <HeroSection />
      <ImpactJourneySection />
      <FeaturedProjectsSection />
      <TransparencySection />
      <CTASection />
      {/* Giữ lại LandingFooter của bạn nếu có */}
    </div>
  );
}

// 1. Hero Section
function HeroSection() {
  return (
    <section className="relative pt-20 pb-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
          Nơi Lòng trắc ẩn gặp <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Sự minh bạch</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Tham gia mạng xã hội đầu tiên dành riêng cho gây quỹ minh bạch, kết nối tình nguyện viên và tạo tác động cộng đồng thực sự.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-xl shadow-yellow-500/20">
              Tham gia mạng lưới
            </Button>
          </Link>
          <Link to={ROUTES.PROJECTS}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white hover:bg-slate-50">
              Khám phá dự án
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-yellow-300 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-200 rounded-full blur-[120px]" />
      </div>
    </section>
  );
}

function ImpactJourneySection() {
  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Hành trình tạo tác động của bạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {impactJourneys.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 ${item.iconBg} ${item.iconColor} rounded-xl flex items-center justify-center mb-6`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Các dự án đang cần bạn ngay lúc này</h2>
            <p className="text-slate-600 mt-2 text-lg">Những dự án đã được kiểm duyệt đang chờ cộng đồng chung tay.</p>
          </div>
          <Link to={ROUTES.PROJECTS} className="text-primary font-bold flex items-center gap-2 hover:text-primary-hover group transition-colors">
            Xem tất cả dự án <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TransparencySection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative shadow-2xl">
          <div className="flex-1 z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-10 leading-tight">100% Minh bạch.<br />Không còn mơ hồ.</h2>
            <ul className="space-y-6">
              {transparencyPromises.map((promise) => (
                <li key={promise.id} className="flex items-start gap-4 text-lg text-slate-300">
                  <div className="mt-1 bg-primary/20 p-1.5 rounded-lg text-primary">
                    <promise.icon size={24} />
                  </div>
                  <span>{promise.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 flex justify-center z-10 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-[80px] rounded-full" />
              <Shield size={200} strokeWidth={1} className="text-primary relative drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 px-6 text-center">
      <div className="max-w-3xl mx-auto animate-in fade-in duration-1000">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-10">Bạn đã sẵn sàng tạo khác biệt?</h2>
        <Link to={ROUTES.REGISTER}>
          <Button variant="primary" size="lg" className="!px-12 !py-5 !text-xl shadow-xl shadow-yellow-500/20">
            Tạo tài khoản miễn phí
          </Button>
        </Link>
        <p className="mt-8 text-slate-500 font-medium">
          Tham gia cùng hơn 50.000 người đang tạo tác động tích cực mỗi ngày.
        </p>
      </div>
    </section>
  );
}