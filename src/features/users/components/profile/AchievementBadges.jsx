import {
  HeartPulse,
  GraduationCap,
  TreePine,
  LifeBuoy,
  Hammer,
  Award,
} from "lucide-react";

const ICON_MAP = {
  heart: HeartPulse,
  "graduation-cap": GraduationCap,
  "tree-pine": TreePine,
  "life-buoy": LifeBuoy,
  hammer: Hammer,
  award: Award,
};

export function AchievementBadges({ badges = [] }) {
  if (!Array.isArray(badges) || badges.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-900">Huy hiệu đóng góp</h2>
        <p className="mt-1 text-sm text-slate-500">
          Huy hiệu được mở khóa theo các dự án volunteer đã hoàn thành.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => {
          const Icon = ICON_MAP[badge.icon] || Award;

          return (
            <article
              key={badge.key}
              className="flex flex-col items-center rounded-[24px] border p-6 text-center"
              style={{
                backgroundColor: badge.bgColor,
                borderColor: badge.borderColor,
              }}
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon
                  size={34}
                  strokeWidth={2.2}
                  style={{ color: badge.textColor }}
                />
              </div>

              <h3
                className="text-[18px] font-black"
                style={{ color: badge.textColor }}
              >
                {badge.label}
              </h3>

              <p
                className="mt-2 text-base font-semibold"
                style={{ color: badge.textColor }}
              >
                {badge.count} dự án
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AchievementBadges;