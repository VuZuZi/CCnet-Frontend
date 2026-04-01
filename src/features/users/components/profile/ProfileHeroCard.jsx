import { useRef, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/Button/Button";
import { Link } from "react-router-dom";
import { MapPin, Camera, Loader2, MessageSquare, BadgeCheck } from "lucide-react";
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

export function ProfileHeroCard({
  user,
  isOwnProfile,
  isFollowing,
  onToggleFollow,
  onChat,
  isChatLoading,
  isFollowLoading,
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

  const handleMediaSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAvatar = type === "avatar";
    const limit = isAvatar ? FILE_LIMITS.AVATAR : FILE_LIMITS.COVER;
    const limitMB = limit / (1024 * 1024);

    if (file.size > limit) {
      toast.error(
        `${isAvatar ? "Avatar" : "Cover image"} must be less than ${limitMB}MB`,
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
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

        <div className="h-48 w-full bg-gray-200 relative group">
          <img
            alt="Cover"
            className="w-full h-full object-cover transition-opacity duration-300"
            src={displayCover}
          />

          {isCoverUploading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {isOwnProfile && !isCoverUploading && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                className="!bg-white/90 hover:!bg-white backdrop-blur-sm shadow-sm text-sm !py-1.5 flex items-center gap-2"
                onClick={() => coverInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" /> Change Cover
              </Button>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 pb-6">
          <div className="flex justify-between items-end mb-4">
            <div className="relative group -mt-12 sm:-mt-16 z-10 shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-sm bg-white relative overflow-hidden">
                <img
                  alt={user?.fullName || "User"}
                  className="w-full h-full object-cover"
                  src={displayAvatar}
                />
                {isAvatarUploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                {isOwnProfile && !isAvatarUploading && (
                  <div
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Change Avatar"
                  >
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              {!isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    disabled={isChatLoading}
                    onClick={onChat}
                    isLoading={isChatLoading}
                    className="!rounded-full !py-1.5 sm:!py-2 !px-4 sm:!px-5 text-sm font-semibold transition-colors border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    variant={isFollowing ? "secondary" : "yellow"}
                    disabled={isFollowLoading}
                    onClick={onToggleFollow}
                    className="!rounded-full !py-1.5 sm:!py-2 !px-4 sm:!px-6 text-sm font-semibold shadow-sm"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="!rounded-full !py-1.5 sm:!py-2 !px-4 sm:!px-5 text-sm font-semibold transition-colors border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 flex items-center gap-2"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {user?.fullName || "Unknown User"}
              </h1>
              {user?.isVerified && (
                <BadgeCheck size={20} className="text-blue-500" title="Verified" />
              )}
            </div>
            <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm font-medium">
              <MapPin className="w-4 h-4 text-gray-400" />
              {user?.location || "Location not set"}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed text-sm sm:text-base max-w-2xl whitespace-pre-wrap">
              {user?.headline || "No headline provided."}
            </p>
          </div>

          <div className="flex gap-5 text-sm sm:text-base">
            <Link
              to="/following"
              state={{ defaultTab: "following" }}
              className="cursor-pointer hover:underline"
            >
              <span className="font-bold text-gray-900 mr-1.5">
                {user?.followingCount || 0}
              </span>
              <span className="text-gray-500">Following</span>
            </Link>

            <Link
              to="/following"
              state={{ defaultTab: "followers" }}
              className="cursor-pointer hover:underline"
            >
              <span className="font-bold text-gray-900 mr-1.5">
                {user?.followersCount || 0}
              </span>
              <span className="text-gray-500">Followers</span>
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