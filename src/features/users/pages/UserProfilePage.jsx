import { useParams } from 'react-router-dom';
import { useChatStore } from '@/features/chat/stores/useChatStore';
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation';

import { useProfileIdentity } from "../hooks/useProfileIdentity";
import { useProfile } from "../hooks/useProfile";
import { useFollowUserStatus } from "../hooks/useFollowUserStatus";
import { useToggleFollowUser } from "../hooks/useToggleFollowUser";

import { ProfileHeroCard } from "../components/profile/ProfileHeroCard";
import { ImpactMetrics } from "../components/profile/ImpactMetrics";
import { ImpactBadges } from "../components/profile/ImpactBadges";
import { AboutMeCard } from "../components/profile/AboutMeCard";
import { SkillsSection } from "../components/profile/SkillsSection";
import { UpgradeBanner } from "../components/profile/UpgradeBanner";

export function UserProfilePage() {
  const { id: urlId } = useParams();

  const { isOwnProfile, targetUserId, isAuthReady } = useProfileIdentity(urlId);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError,
  } = useProfile(isOwnProfile ? null : targetUserId);

  const { isFollowing } = useFollowUserStatus(
    isOwnProfile ? null : targetUserId,
  );
  const { toggle, isLoading: isToggleLoading } =
    useToggleFollowUser(targetUserId);

  const openConversation = useChatStore((s) => s.openConversation);
  const focusConversation = useChatStore((s) => s.focusConversation);
  const { createConversationAsync, isLoading: isChatLoading } =
    useCreateConversation();

  const handleOpenChat = async () => {
    if (isOwnProfile || !targetUserId) return;
    try {
      const convo = await createConversationAsync({
        participantId: targetUserId,
      });
      const cid = String(convo?._id || "").trim();
      if (cid) {
        openConversation(cid);
        focusConversation(cid);
      }
    } catch (error) {
      console.error("Failed to open chat", error);
    }
  };

  const handleToggleFollow = () => {
    if (!isOwnProfile && targetUserId) {
      toggle(isFollowing);
    }
  };

  if (!isAuthReady || isProfileLoading) {
    return <ProfileSkeletonLoader />;
  }

  if (isError || !userProfile) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-900">
        <h2 className="text-2xl font-bold text-gray-700">Profile Not Found</h2>
        <p className="text-gray-500 mt-2">
          The user you are looking for does not exist or an error occurred.
        </p>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen text-gray-900 antialiased py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            <ProfileHeroCard
              user={userProfile}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              onToggleFollow={handleToggleFollow}
              onChat={handleOpenChat}
              isChatLoading={isChatLoading}
              isFollowLoading={isToggleLoading}
            />
            <ImpactMetrics />
            <ImpactBadges />
          </section>

          <aside className="space-y-8">
            <AboutMeCard
              about={userProfile.about}
              level={userProfile.level}
              title={userProfile.title}
              createdAt={userProfile.createdAt}
            />
            <SkillsSection skills={userProfile.skills} />
            <UpgradeBanner isOwnProfile={isOwnProfile} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProfileSkeletonLoader() {
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-200 rounded-2xl h-[350px] w-full shadow-sm"></div>
          <div className="bg-gray-200 rounded-2xl h-[150px] w-full shadow-sm"></div>
        </div>
        <div className="space-y-8">
          <div className="bg-gray-200 rounded-2xl h-[250px] w-full shadow-sm"></div>
          <div className="bg-gray-200 rounded-2xl h-[200px] w-full shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
