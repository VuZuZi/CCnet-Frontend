import { format } from "date-fns";
import { Star, ShieldCheck } from "lucide-react";

const isOrganizerProfile = (userLike) => {
  const role = String(userLike?.role || "").toLowerCase();
  return role === "organizer" || Number(userLike?.kyc?.tier || 0) >= 2;
};

export function AboutMeCard({
  about,
  level,
  title,
  createdAt,
  role,
  kyc,
  organization,
}) {
  const joinedDate = createdAt
    ? format(new Date(createdAt), "MMMM yyyy")
    : "Không rõ";

  const isOrganizer = isOrganizerProfile({ role, kyc });

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
        {isOrganizer ? "Giới thiệu tổ chức" : "Giới thiệu bản thân"}
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm leading-relaxed text-gray-600">
            {about ||
              (isOrganizer
                ? "Tổ chức này chưa thêm mô tả về tổ chức."
                : "Người dùng này chưa viết gì về bản thân.")}
          </p>
        </div>

        {isOrganizer && organization?.name && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Tổ chức đã xác minh
            </div>
            <p className="text-sm text-emerald-700">{organization.name}</p>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            Cấp độ {level || 1} {title || "Thành viên"}
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
          <span>Tham gia từ {joinedDate}</span>
        </div>
      </div>
    </article>
  );
}

export default AboutMeCard;