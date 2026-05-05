import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  HeartHandshake,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import heroBg from "@/assets/landing/hero-community.jpg";

import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/components/ui/Button/Button";
import { ProjectCard } from "@/features/landing/components/ProjectCard";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { PROJECT_QUERY_KEYS } from "@/features/project/hooks/useProjectQueries";
import {
  impactJourneys,
  transparencyPromises,
} from "@/features/landing/data/landing.data";
import { projectAPI } from "@/features/project/api/projectAPI";
import { SupportDonationCard } from "@/features/transaction/components/SupportDonationCard";

const formatCurrencyShort = (value) => {
  const numericValue = Number(value || 0);

  if (numericValue >= 1_000_000_000) {
    return `${(numericValue / 1_000_000_000).toFixed(
      numericValue >= 10_000_000_000 ? 0 : 1,
    )} tỷ`;
  }

  if (numericValue >= 1_000_000) {
    return `${(numericValue / 1_000_000).toFixed(
      numericValue >= 10_000_000 ? 0 : 1,
    )} triệu`;
  }

  return `${numericValue.toLocaleString("vi-VN")}đ`;
};

const formatInteger = (value) => Number(value || 0).toLocaleString("vi-VN");

function useAnimatedNumber(target, duration = 1000) {
  const [displayValue, setDisplayValue] = useState(Number(target || 0));
  const previousValueRef = useRef(Number(target || 0));

  useEffect(() => {
    const nextValue = Number(target || 0);
    const startValue = previousValueRef.current;

    if (startValue === nextValue) {
      setDisplayValue(nextValue);
      return undefined;
    }

    let frameId;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - (1 - progress) ** 3;
      const currentValue = Math.round(
        startValue + (nextValue - startValue) * easedProgress,
      );

      setDisplayValue(currentValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        previousValueRef.current = nextValue;
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [duration, target]);

  return displayValue;
}

function AnimatedMetric({ label, value, formatter, accent = "amber" }) {
  const animatedValue = useAnimatedNumber(value);

  const accentClasses = {
    amber: "from-amber-100 via-white to-rose-50 text-amber-700",
    sky: "from-sky-100 via-white to-cyan-50 text-sky-700",
    emerald: "from-emerald-100 via-white to-lime-50 text-emerald-700",
    slate: "from-slate-100 via-white to-slate-50 text-slate-800",
    rose: "from-rose-100 via-white to-orange-50 text-rose-700",
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]">
      <div
        className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${accentClasses[accent] || accentClasses.amber}`}
      >
        Live
      </div>
      <p className="mt-5 text-[clamp(1.8rem,3vw,2.8rem)] font-black tracking-tight text-slate-900">
        {formatter(animatedValue)}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function LandingPage() {
  const landingMetricsQuery = useQuery({
    queryKey: PROJECT_QUERY_KEYS.landingMetrics,
    queryFn: () => projectAPI.getLandingMetrics(),
    staleTime: 10 * 1000,
    refetchInterval: 20 * 1000,
    refetchOnWindowFocus: false,
  });

  const featuredProjectsQuery = useQuery({
    queryKey: ["landing", "featured-projects"],
    queryFn: () => projectAPI.getExplore({ page: 1, limit: 3, sort: "trending" }),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const metrics = landingMetricsQuery.data || {};
  const featuredProjects = useMemo(
    () => featuredProjectsQuery.data?.projects || [],
    [featuredProjectsQuery.data],
  );

  const statItems = useMemo(
    () => [
      {
        key: "funds",
        label: "Tổng tiền donate đã ghi nhận",
        value: Number(metrics?.totalFundsRaised || 0),
        formatter: formatCurrencyShort,
        accent: "amber",
      },
      {
        key: "projects",
        label: "Dự án đang công khai",
        value: Number(metrics?.totalProjects || 0),
        formatter: formatInteger,
        accent: "sky",
      },
      {
        key: "volunteers",
        label: "Tình nguyện viên đang tham gia",
        value: Number(metrics?.totalVolunteers || 0),
        formatter: formatInteger,
        accent: "emerald",
      },
      {
        key: "supporters",
        label: "Nhà ủng hộ đã đồng hành",
        value: Number(metrics?.totalSupporters || 0),
        formatter: formatInteger,
        accent: "rose",
      },
    ],
    [metrics],
  );

  return (
    <div className="overflow-hidden bg-[linear-gradient(180deg,#fffdf8_0%,#fff7ea_22%,#ffffff_44%,#f8fbff_100%)]">
      <HeroSection metrics={metrics} />
      <section className="px-6 py-8 sm:py-10">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item) => (
            <AnimatedMetric
              key={item.key}
              label={item.label}
              value={item.value}
              formatter={item.formatter}
              accent={item.accent}
            />
          ))}
        </div>
      </section>

      <ImpactJourneySection />

      <FeaturedProjectsSection
        projects={featuredProjects}
        isLoading={featuredProjectsQuery.isLoading}
      />

      <TransparencySection metrics={metrics} />

      <SupportSection supportBalance={Number(metrics?.webSupportFundBalance || 0)} />

      <CTASection />
      <LandingFooter />
    </div>
  );
}

function HeroSection({ metrics }) {
  return (
    <section 
      className="relative flex min-h-[78vh] w-full items-center bg-slate-900 bg-cover bg-center bg-no-repeat px-6 py-24 sm:min-h-[85vh]"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent sm:bg-gradient-to-r sm:from-black/85 sm:via-black/60 sm:to-transparent" />
      
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="max-w-3xl text-left">
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Gửi trọn niềm tin
            
            <span className="bg-[linear-gradient(90deg,#FBBF24_0%,#FDA4AF_100%)] bg-clip-text text-transparent">
              {" "}
              cùng cộng đồng
            </span>
            {" "}.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            CCNet kết nối tổ chức và tình nguyện viên trên cùng một
            nền tảng. Quyên góp, giải ngân và tiến độ dự án đều được theo dõi
            rõ ràng thay vì chỉ dừng ở lời hứa.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to={ROUTES.REGISTER}>
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-[0_20px_40px_rgba(245,158,11,0.26)] sm:w-auto"
              >
                Tham gia mạng lưới
              </Button>
            </Link>
            <Link to={ROUTES.PROJECTS}>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
              >
                Khám phá dự án
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-slate-200">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-sm backdrop-blur-sm">
              <TrendingUp size={16} className="text-amber-400" />
              Ghi nhận {formatCurrencyShort(metrics?.totalFundsRaised || 0)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-sm backdrop-blur-sm">
              <UsersRound size={16} className="text-sky-300" />
              {formatInteger(metrics?.totalSupporters || 0)} nhà ủng hộ
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactJourneySection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
            Hành trình đồng hành
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Từ lúc quan tâm đến lúc tạo ra tác động, mọi bước đều có chỗ đứng.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {impactJourneys.map((item) => (
            <div
              key={item.id}
              className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
              >
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectsSection({ projects, isLoading }) {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Các dự án đang cần cộng đồng chung tay lúc này.
            </h2>
          </div>

          <Link
            to={ROUTES.PROJECTS}
            className="inline-flex items-center gap-2 text-sm font-black text-amber-700 transition hover:text-amber-800"
          >
            Xem toàn bộ dự án
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`project-skeleton-${index}`}
                  className="h-[430px] animate-pulse rounded-[28px] border border-slate-200 bg-white"
                />
              ))
            : projects.map((project) => (
                <ProjectCard key={project._id || project.id} project={project} />
              ))}
        </div>
      </div>
    </section>
  );
}

function TransparencySection({ metrics }) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_48%,#334155_100%)] p-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.2)] md:p-14">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-4xl font-black leading-tight md:text-5xl">
              Minh bạch không còn là khẩu hiệu.
            </h2>
            <ul className="mt-10 space-y-5">
              {transparencyPromises.map((promise) => (
                <li
                  key={promise.id}
                  className="flex items-start gap-4 text-base leading-8 text-slate-200"
                >
                  <div className="mt-1 rounded-xl bg-amber-400/15 p-2 text-amber-300">
                    <promise.icon size={20} />
                  </div>
                  <span>{promise.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <TransparencyCard
              label="Tổ chức đang vận hành"
              value={formatInteger(metrics?.totalOrganizers || 0)}
            />
            <TransparencyCard
              label="Nhà ủng hộ đã tham gia"
              value={formatInteger(metrics?.totalSupporters || 0)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TransparencyCard({ label, value }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-300">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function SupportSection({ supportBalance }) {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="max-w-3xl">
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Ủng hộ chúng tôi 
          </h2>
          <p className="mt-3 text-base leading-8 text-slate-600">
            Sự đồng hành của bạn giúp CCNet vận hành ổn định để cộng đồng và các dự án tiếp tục kết nối.
          </p>
        </div>
        <SupportDonationCard supportBalance={supportBalance} showBalance={false} />
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-28 text-center">
      <div className="mx-auto max-w-3xl rounded-[40px] border border-amber-100 bg-[linear-gradient(180deg,#fff9ec_0%,#ffffff_100%)] px-8 py-14 shadow-[0_20px_60px_rgba(245,158,11,0.12)]">
        <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
          Sẵn sàng đồng hành cùng một nền tảng tử tế hơn?
        </h2>
        <p className="mt-5 text-base leading-8 text-slate-600">
          Tạo tài khoản để theo dõi dự án, quyên góp, tham gia tình nguyện và
          nhận các cập nhật minh bạch theo thời gian thực.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to={ROUTES.REGISTER}>
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-[0_20px_40px_rgba(245,158,11,0.22)] sm:w-auto"
            >
              Tạo tài khoản miễn phí
            </Button>
          </Link>
          <Link to={ROUTES.PROJECTS}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Xem dự án đang mở
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
