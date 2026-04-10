import { useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Users,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";

const colorByCategory = {
  Y_TE: {
    bg: "bg-card-blue-bg",
    border: "border-blue-100",
    text: "text-blue-900",
    barBg: "bg-blue-200",
    barFill: "bg-blue-500",
    icon: "text-blue-600",
  },
  GIAO_DUC: {
    bg: "bg-card-purple-bg",
    border: "border-purple-100",
    text: "text-purple-900",
    barBg: "bg-purple-200",
    barFill: "bg-purple-500",
    icon: "text-purple-600",
  },
  MOI_TRUONG: {
    bg: "bg-card-green-bg",
    border: "border-green-100",
    text: "text-green-900",
    barBg: "bg-green-200",
    barFill: "bg-green-500",
    icon: "text-green-600",
  },
  THIEN_TAI: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-900",
    barBg: "bg-red-200",
    barFill: "bg-red-500",
    icon: "text-red-600",
  },
  XAY_DUNG: {
    bg: "bg-card-yellow-bg",
    border: "border-amber-100",
    text: "text-amber-900",
    barBg: "bg-amber-200",
    barFill: "bg-amber-500",
    icon: "text-amber-600",
  },
};

function getProjectColors(project) {
  return colorByCategory[project?.category] || colorByCategory.MOI_TRUONG;
}

function getVolunteerStats(project) {
  const current = Number(
    project?.stats?.currentVolunteers ??
      project?.stats?.volunteerJoined ??
      0
  );

  const target =
    Number(
      project?.stats?.targetVolunteers ?? project?.stats?.volunteerNeeded ?? 0
    ) ||
    Number(
      Array.isArray(project?.volunteerRoles)
        ? project.volunteerRoles.reduce(
            (sum, role) => sum + Number(role?.quantity || 0),
            0
          )
        : 0
    );

  const percent =
    target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return { current, target, percent, isFull: target > 0 && current >= target };
}

function getFundingStats(project) {
  const current = Number(
    project?.financialDetail?.availableBalance ??
      project?.currentAmount ??
      project?.stats?.raisedAmount ??
      0
  );

  const target = Number(
    project?.targetAmount ?? project?.stats?.targetAmount ?? 0
  );

  const percent =
    target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return { current, target, percent, isComplete: target > 0 && current >= target };
}

function stripHtmlTags(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function VolunteerCall({ projects = [] }) {
  const scrollerRef = useRef(null);
  const intervalRef = useRef(null);
  const isHoveredRef = useRef(false);
  const manualPauseTimeoutRef = useRef(null);
  const isManualPausedRef = useRef(false);

  const items = useMemo(
    () =>
      (Array.isArray(projects) ? projects : []).filter(
        (project) => project?._id
      ),
    [projects]
  );

  const loopItems = useMemo(() => {
    if (!items.length) return [];
    return [...items, ...items];
  }, [items]);

  const pauseAutoScrollTemporarily = (duration = 900) => {
    isManualPausedRef.current = true;

    if (manualPauseTimeoutRef.current) {
      clearTimeout(manualPauseTimeoutRef.current);
    }

    manualPauseTimeoutRef.current = setTimeout(() => {
      isManualPausedRef.current = false;
    }, duration);
  };

  const normalizeLoopPosition = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const resetPoint = scroller.scrollWidth / 2;

    if (scroller.scrollLeft >= resetPoint) {
      scroller.scrollLeft -= resetPoint;
    } else if (scroller.scrollLeft < 0) {
      scroller.scrollLeft += resetPoint;
    }
  };

  const scrollByOffset = (offset) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    pauseAutoScrollTemporarily(1200);

    scroller.scrollBy({
      left: offset,
      behavior: "smooth",
    });

    setTimeout(() => {
      normalizeLoopPosition();
    }, 450);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || items.length <= 1) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!scroller) return;
      if (isHoveredRef.current) return;
      if (isManualPausedRef.current) return;

      const resetPoint = scroller.scrollWidth / 2;
      const nextLeft = scroller.scrollLeft + 1;

      if (nextLeft >= resetPoint) {
        scroller.scrollLeft = 0;
      } else {
        scroller.scrollLeft = nextLeft;
      }
    }, 16);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (manualPauseTimeoutRef.current) {
        clearTimeout(manualPauseTimeoutRef.current);
        manualPauseTimeoutRef.current = null;
      }
    };
  }, [items.length]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  if (!items.length) return null;

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Users className="text-emerald-500" size={24} />
          Kêu gọi tình nguyện viên
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByOffset(-360)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="text-slate-600" size={20} />
          </button>

          <button
            type="button"
            onClick={() => scrollByOffset(360)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50"
          >
            <ChevronRight className="text-slate-600" size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex gap-6 overflow-x-auto pb-4 no-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {loopItems.map((project, index) => {
          const cover =
            project?.coverMedia?.url ||
            "https://images.unsplash.com/photo-1593113598332-cd59a93c6132?q=80&w=1200&auto=format&fit=crop";

          const colors = getProjectColors(project);
          const { current, target, percent, isFull } = getVolunteerStats(project);
          const { current: raisedAmount, target: targetAmount, percent: fundingPercent } =
            getFundingStats(project);

          const isOnline = /trực tuyến|online/i.test(
            project?.location?.address || ""
          );
          const isFunded = project?.projectType === "FUNDED";

          return (
            <div
              key={`${project._id}-${index}`}
              className="flex min-w-[320px] w-[320px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <Link
                to={`/projects/${project._id}`}
                className="relative block h-36 bg-slate-200"
              >
                <img
                  alt={project?.title}
                  className="h-full w-full object-cover"
                  src={cover}
                  loading="lazy"
                />

                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-sm">
                  {isOnline ? <Globe size={14} /> : <MapPin size={14} />}
                  {project?.location?.address || "Chưa cập nhật"}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <Link to={`/projects/${project._id}`}>
                  <h4 className="mb-2 line-clamp-1 text-lg font-bold text-slate-900 hover:text-amber-600">
                    {project?.title}
                  </h4>
                </Link>

                <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                  {stripHtmlTags(project?.summary || project?.description) ||
                    "Dự án đang cần thêm tình nguyện viên tham gia hỗ trợ."}
                </p>

                <div className="mt-auto">
                  <div
                    className={`mb-4 flex items-center gap-2 rounded-xl border p-3 ${colors.bg} ${colors.border}`}
                  >
                    <Users className={colors.icon} size={20} />
                    <div className="flex-1">
                      <div
                        className={`mb-1.5 flex justify-between text-xs font-bold ${colors.text}`}
                      >
                        <span>{isFull ? "Đã đủ" : "Cần tuyển"}</span>
                        <span>
                          {current}/{target || 0}
                        </span>
                      </div>

                      <div
                        className={`h-1.5 w-full overflow-hidden rounded-full ${colors.barBg}`}
                      >
                        <div
                          className={`h-full rounded-full ${colors.barFill}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {isFunded && targetAmount > 0 ? (
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Heart size={16} className="text-amber-500" />
                      <span>
                        {raisedAmount.toLocaleString("vi-VN")}đ /{" "}
                        {targetAmount.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="ml-auto text-amber-600">
                        {fundingPercent}%
                      </span>
                    </div>
                  ) : null}

                  {isFull ? (
                    <Link
                      to={`/projects/${project._id}`}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      Xem chi tiết
                    </Link>
                  ) : (
                    <Link
                      to={`/projects/${project._id}`}
                      className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-600"
                    >
                      Tham gia
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default VolunteerCall;