import { useRef, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/Button/Button";
import { Link } from "react-router-dom";
import {
  MapPin,
  Camera,
  Loader2,
  MessageSquare,
  BadgeCheck,
  Building2,
  Globe,
  HeartPulse,
  GraduationCap,
  TreePine,
  LifeBuoy,
  Hammer,
  Award,
} from "lucide-react";
import { useUploadMedia } from "../../hooks/useUploadMedia";
import { useToast } from "@/shared/contexts/ToastContext";
import { EditProfileModal } from "./EditProfileModal";

const FILE_LIMITS = {
  AVATAR: 2 * 1024 * 1024,
  COVER: 5 * 1024 * 1024,
};

const DEFAULT_IMAGES = {
  COVER:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop",
  AVATAR:
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp",
};

const HERO_BADGE_ICON_MAP = {
  heart: HeartPulse,
  "graduation-cap": GraduationCap,
  "tree-pine": TreePine,
  "life-buoy": LifeBuoy,
  hammer: Hammer,
  award: Award,
};

const isOrganizerProfile = (user) => {
  const role = String(user?.role || "").toLowerCase();
  return role === "organizer" || Number(user?.kyc?.tier || 0) >= 2;
};

function ProfileAchievementBadges({ badges = [] }) {
  if (!Array.isArray(badges) || badges.length === 0) {
    return null;
  }

  const visibleBadges = badges.slice(0, 4);
  const remainingCount = badges.length - visibleBadges.length;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {visibleBadges.map((badge) => {
        const Icon = HERO_BADGE_ICON_MAP[badge.icon] || Award;

        return (
          <div
            key={badge.key}
            className="inline-flex items-center gap-2 rounded-full border bg-white/92 px-3 py-1.5 shadow-sm backdrop-blur-sm"
            style={{
              borderColor: badge.borderColor,
            }}
            title={`${badge.label} • ${badge.count} dự án`}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: badge.bgColor }}
            >
              <Icon
                size={13}
                strokeWidth={2.4}
                style={{ color: badge.textColor }}
              />
            </span>

            <span
              className="max-w-[120px] truncate text-xs font-bold"
              style={{ color: badge.textColor }}
            >
              {badge.label}
            </span>

            {badge.count > 1 ? (
  <span
    className="rounded-full px-1.5 py-0.5 text-[11px] font-black"
    style={{
      backgroundColor: badge.bgColor,
      color: badge.textColor,
    }}
  >
    x{badge.count}
  </span>
) : null}
          </div>
        );
      })}

      {remainingCount > 0 ? (
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/92 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
          +{remainingCount}
        </div>
      ) : null}
    </div>
  );
}

export function ProfileHeroCard({
  user,
  achievementBadges = [],
  isOwnProfile,
  isFollowing,
  onToggleFollow,
  onChat,
  onReport,
  isChatLoading,
  isFollowLoading,
  isReportLoading,
}) {
  const toast = useToast();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { mutate: uploadAvatar, isPending: isAvatarUploading } =
    useUploadMedia("avatar");
  const { mutate: uploadCover, isPending: isCoverUploading } =
    useUploadMedia("cover");

  const displayCover = coverPreview || user?.coverPhoto || DEFAULT_IMAGES.COVER;
  const displayAvatar = avatarPreview || user?.avatar || DEFAULT_IMAGES.AVATAR;
  const locationText =
    user?.location?.address ||
    user?.organization?.location?.address ||
    "Chưa cập nhật địa chỉ";
  const isOrganizer = isOrganizerProfile(user);
  const organizationName = user?.organization?.name || "";
  const organizationType = user?.organization?.type || "";
  const organizationWebsite = user?.organization?.website || "";

  const handleMediaSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAvatar = type === "avatar";
    const limit = isAvatar ? FILE_LIMITS.AVATAR : FILE_LIMITS.COVER;
    const limitMB = limit / (1024 * 1024);

    if (file.size > limit) {
      toast.error(
        `${isAvatar ? "Ảnh đại diện" : "Ảnh bìa"} phải nhỏ hơn ${limitMB}MB`
      );
      e.target.value = null;
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (isAvatar) setAvatarPreview(previewUrl);
    else setCoverPreview(previewUrl);

    const uploadAction = isAvatar ? uploadAvatar : uploadCover;
    const clearPreview = () => {
      URL.revokeObjectURL(previewUrl);
      if (isAvatar) setAvatarPreview(null);
      else setCoverPreview(null);
    };

    uploadAction(file, {
      onSuccess: clearPreview,
      onError: clearPreview,
    });

    e.target.value = null;
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [avatarPreview, coverPreview]);

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <input
          type="file"
          ref={avatarInputRef}
          className="hidden"
          accept="image/jpeg, image/png, image/webp, image/gif"
          onChange={(e) => handleMediaSelect(e, "avatar")}
        />
        <input
          type="file"
          ref={coverInputRef}
          className="hidden"
          accept="image/jpeg, image/png, image/webp, image/gif"
          onChange={(e) => handleMediaSelect(e, "cover")}
        />

        <div className="group relative h-48 w-full bg-gray-200">
          <img
            alt="Ảnh bìa"
            className="h-full w-full object-cover transition-opacity duration-300"
            src={displayCover}
          />

          {isCoverUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {isOwnProfile && !isCoverUploading && (
            <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                className="flex items-center gap-2 !bg-white/90 !py-1.5 text-sm shadow-sm backdrop-blur-sm hover:!bg-white"
                onClick={() => coverInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" /> Đổi ảnh bìa
              </Button>
            </div>
          )}
        </div>

        <div className="px-4 pb-6 sm:px-6">
          <div className="mb-4 flex items-end justify-between">
            <div className="group relative z-10 -mt-12 shrink-0 sm:-mt-16">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-sm sm:h-32 sm:w-32">
                <img
                  alt={user?.fullName || "Người dùng"}
                  className="h-full w-full object-cover"
                  src={displayAvatar}
                />
                {isAvatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {isOwnProfile && !isAvatarUploading && (
                  <div
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-2 flex items-center gap-2 sm:mb-4 sm:gap-3">
              {!isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    disabled={isChatLoading}
                    onClick={onChat}
                    isLoading={isChatLoading}
                    className="flex items-center gap-2 rounded-full border border-gray-300 bg-white !px-4 !py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 sm:!px-5 sm:!py-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Nhắn tin
                  </Button>
                  <Button
                    variant={isFollowing ? "secondary" : "yellow"}
                    disabled={isFollowLoading}
                    onClick={onToggleFollow}
                    className="rounded-full !px-4 !py-1.5 text-sm font-semibold shadow-sm sm:!px-6 sm:!py-2"
                  >
                    {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={isReportLoading}
                    onClick={onReport}
                    className="rounded-full !px-4 !py-1.5 text-sm font-semibold sm:!px-5 sm:!py-2"
                  >
                    Báo cáo
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white !px-4 !py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 sm:!px-5 sm:!py-2"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
                {user?.fullName || "Người dùng không xác định"}
              </h1>

              {isOrganizer && (
                <>
                  <BadgeCheck className="h-5 w-5 text-sky-500" />
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                    Nhà tổ chức
                  </span>
                </>
              )}
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <MapPin className="h-4 w-4 text-gray-400" />
              {locationText}
            </p>

            {!isOrganizer ? (
              <ProfileAchievementBadges badges={achievementBadges} />
            ) : null}

            {isOrganizer && organizationName && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>{organizationName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {organizationType && <span>{organizationType}</span>}
                  {organizationType && organizationWebsite && (
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                  )}
                  {organizationWebsite && (
                    <a
                      href={organizationWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-600 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-gray-800 sm:text-base">
              {user?.headline || "Chưa có tiêu đề giới thiệu."}
            </p>
          </div>

          <div className="flex gap-5 text-sm sm:text-base">
            <Link
              to="/following"
              state={{ defaultTab: "following" }}
              className="cursor-pointer hover:underline"
            >
              <span className="mr-1.5 font-bold text-gray-900">
                {user?.followingCount || 0}
              </span>
              <span className="text-gray-500">Đang theo dõi</span>
            </Link>

            <Link
              to="/following"
              state={{ defaultTab: "followers" }}
              className="cursor-pointer hover:underline"
            >
              <span className="mr-1.5 font-bold text-gray-900">
                {user?.followersCount || 0}
              </span>
              <span className="text-gray-500">Người theo dõi</span>
            </Link>
          </div>
        </div>
      </article>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
        />
      )}
    </>
  );
}

export default ProfileHeroCard;