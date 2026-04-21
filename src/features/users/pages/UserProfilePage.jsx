import { useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useChatStore } from '@/features/chat/stores/useChatStore';
import { useCreateConversation } from '@/features/chat/hooks/conversations/useCreateConversation';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { Building2, Heart, Wallet, ShieldCheck } from 'lucide-react';
import PostFeed from '@/features/Community/components/post/PostFeed';

import { useProfileIdentity } from "../hooks/useProfileIdentity";
import { useProfile } from "../hooks/useProfile";
import { useFollowUserStatus } from "../hooks/useFollowUserStatus";
import { useToggleFollowUser } from "../hooks/useToggleFollowUser";
import { useReportUser } from "../hooks/useReportUser";
import { useSupportedProjects } from "@/features/volunteer/hooks/useSupportedProjects";

import { ProfileHeroCard } from "../components/profile/ProfileHeroCard";
import { ImpactMetrics } from "../components/profile/ImpactMetrics";
import { AboutMeCard } from "../components/profile/AboutMeCard";
import { SkillsSection } from "../components/profile/SkillsSection";
import { UpgradeBanner } from "../components/profile/UpgradeBanner";
import { DonationHistoryList } from '@/features/transaction/components/DonationHistoryList';
import { WalletDashboard } from '@/features/wallet/components/WalletDashboard';
import { BankAccountManager } from '@/features/bank/components/BankAccountManager';
import { CreatePostComposer } from '@/features/Community/components/post/CreatePostComposer';

const isOrganizerProfile = (user) => {
  const role = String(user?.role || "").toLowerCase();
  return role === "organizer" || Number(user?.kyc?.tier || 0) >= 2;
};

function OrganizerOverviewCard({ user }) {
  if (!isOrganizerProfile(user)) return null;

  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-700">
        <Building2 className="h-4 w-4" />
        Tổng quan nhà tổ chức
      </h2>

      <div className="space-y-3 text-sm text-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tên tổ chức
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {user?.organization?.name || "Chưa có thông tin"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Loại hình tổ chức
          </p>
          <p className="mt-1">{user?.organization?.type || "Chưa có thông tin"}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Website
          </p>
          <p className="mt-1">
            {user?.organization?.website ? (
              <a
                href={user.organization.website}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:underline"
              >
                {user.organization.website}
              </a>
            ) : (
              "Chưa có thông tin"
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Khu vực hoạt động
          </p>
          <p className="mt-1">
            {user?.organization?.location?.address || "Chưa có thông tin"}
          </p>
        </div>
      </div>
    </article>
  );
}

function OrganizerTrustCard({ user }) {
  if (!isOrganizerProfile(user)) return null;

  return (
    <article className="rounded-2xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-700">
        <ShieldCheck className="h-4 w-4" />
        Trạng thái xác minh
      </h2>

      <div className="space-y-3 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Vai trò</span>
          <span className="font-semibold text-slate-900">
            {String(user?.role || "user")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Bậc KYC</span>
          <span className="font-semibold text-slate-900">
            {user?.kyc?.tier ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Trạng thái</span>
          <span className="font-semibold text-slate-900">
            {user?.kyc?.status || "UNVERIFIED"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function UserProfilePage() {
  const { id: urlId } = useParams();

  const { isOwnProfile, targetUserId, isAuthReady } = useProfileIdentity(urlId);
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const currentUserId = useAuthStore(authSelectors.userId);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState(null);
  const [financeTab, setFinanceTab] = useState('bank');
  const currentView = searchParams.get('view');
  const showWalletView = isOwnProfile && currentView === 'wallet';

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError,
  } = useProfile(isOwnProfile ? null : targetUserId);

  const { isFollowing } = useFollowUserStatus(
    isOwnProfile ? null : targetUserId
  );
  const { toggle, isLoading: isToggleLoading } =
    useToggleFollowUser(targetUserId);

  const openConversation = useChatStore((s) => s.openConversation);
  const focusConversation = useChatStore((s) => s.focusConversation);
  const { createConversationAsync, isLoading: isChatLoading } =
    useCreateConversation();
  const { mutateAsync: reportUser, isPending: isReportLoading } =
    useReportUser();
  const { data: supportedProjectsData } = useSupportedProjects(
    { page: 1, limit: 1, view: "ALL" },
    isOwnProfile
  );

  const supportedCount = supportedProjectsData?.summary?.totalSupported || 0;
  const profileUserId = isOwnProfile ? currentUserId : targetUserId;
  const isOrganizer = isOrganizerProfile(userProfile);

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
      toast.error("Không thể mở cuộc trò chuyện lúc này.");
    }
  };

  const handleToggleFollow = () => {
    if (!isOwnProfile && targetUserId) toggle(isFollowing);
  };

  const handleReportUser = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để báo cáo người dùng");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setReportError(null);
    setReportReason("");
    setReportDescription("");
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (event) => {
    event.preventDefault();
    if (!targetUserId) return setReportError("Không tìm thấy người dùng để báo cáo.");
    if (!reportReason) return setReportError("Vui lòng chọn lý do báo cáo.");

    try {
      await reportUser({
        userId: targetUserId,
        payload: {
          reason_code: reportReason,
          description: reportDescription.trim(),
        },
      });
      setReportModalOpen(false);
    } catch (error) {
      setReportError(error.response?.data?.message || "Gửi báo cáo thất bại.");
    }
  };

  if (!isAuthReady || isProfileLoading) return <ProfileSkeletonLoader />;

  if (isError || !userProfile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
        <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy hồ sơ</h2>
        <p className="mt-2 text-gray-500">
          Người dùng bạn đang tìm không tồn tại hoặc đã xảy ra lỗi.
        </p>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen text-gray-900 antialiased py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {showWalletView ? (
          <div className="space-y-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-900">Trung tâm tài chính</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Quản lý ngân hàng, ví và ủng hộ theo từng nhóm để thao tác nhanh hơn.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setFinanceTab('bank')}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    financeTab === 'bank'
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-black">
                    <Building2 size={16} /> Ngân hàng
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Đăng ký tài khoản nhận tiền
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFinanceTab('wallet')}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    financeTab === 'wallet'
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-black">
                    <Wallet size={16} /> Ví & giao dịch
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Số dư, rút tiền, sao kê ví
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFinanceTab('donation')}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    financeTab === 'donation'
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-black">
                    <Heart size={16} /> Ủng hộ
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Các khoản đã ủng hộ & hoàn tiền
                  </p>
                </button>
              </div>
            </div>

            {financeTab === 'bank' ? <BankAccountManager /> : null}
            {financeTab === 'wallet' ? <WalletDashboard /> : null}
            {financeTab === 'donation' ? <DonationHistoryList /> : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-8 lg:col-span-2">
              <ProfileHeroCard
  user={userProfile}
  achievementBadges={userProfile?.achievementBadges || []}
  isOwnProfile={isOwnProfile}
  isFollowing={isFollowing}
  onToggleFollow={handleToggleFollow}
  onChat={handleOpenChat}
  onReport={handleReportUser}
  isChatLoading={isChatLoading}
  isFollowLoading={isToggleLoading}
  isReportLoading={isReportLoading}
/>

              <ImpactMetrics
                supportedCount={supportedCount}
                completedCount={userProfile?.impactMetrics?.completedCount || 0}
                averageRating={userProfile?.impactMetrics?.averageRating || 0}
                trustScore={userProfile?.impactMetrics?.trustScore || 0}
                isOwnProfile={isOwnProfile}
                onOpenSupportedProjects={() =>
                  navigate("/profile/supported-projects")
                }
              />

              {isOwnProfile ? (
                <CreatePostComposer
                  title="Đăng bài trên hồ sơ của bạn"
                  subtitle="Mở popup để soạn bài, thêm ảnh/video và chọn Công khai hoặc Riêng tư."
                  defaultPrivacy="public"
                  showPrivacySelector
                  buttonLabel="Đăng lên hồ sơ"
                  compactTrigger
                />
              ) : null}

              <div className="space-y-4">
                <div className="mb-2 px-1">
                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                    Bài đăng của {isOwnProfile ? 'bạn' : 'người dùng này'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Dòng thời gian cá nhân theo thứ tự mới nhất.
                  </p>
                </div>

                <PostFeed
                  currentUserId={currentUserId}
                  onReport={(postId) => navigate(`/community/${postId}`)}
                  feedType="profile"
                  profileUserId={profileUserId}
                  emptyMessage="Chưa có bài đăng nào trong tường cá nhân."
                />
              </div>
            </section>

            <aside className="space-y-8">
              {isOrganizer && <OrganizerOverviewCard user={userProfile} />}
              <AboutMeCard
                about={userProfile.about}
                level={userProfile.level}
                title={userProfile.title}
                createdAt={userProfile.createdAt}
                role={userProfile.role}
                kyc={userProfile.kyc}
                organization={userProfile.organization}
              />
              {isOrganizer && <OrganizerTrustCard user={userProfile} />}
              <SkillsSection skills={userProfile.skills} />
              {!isOrganizer && <UpgradeBanner isOwnProfile={isOwnProfile} />}
            </aside>
          </div>
        )}
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Báo cáo người dùng
                </h3>
                <p className="text-sm text-slate-500">
                  Gửi báo cáo đến quản trị viên để kiểm duyệt tài khoản này.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="text-2xl font-bold text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <form className="space-y-5 px-6 py-6" onSubmit={handleSubmitReport}>
              {reportError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {reportError}
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Lý do báo cáo
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => {
                    setReportReason(e.target.value);
                    setReportError(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="">Chọn lý do</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Quấy rối</option>
                  <option value="inappropriate">Nội dung không phù hợp</option>
                  <option value="violence">Bạo lực</option>
                  <option value="hate_speech">Ngôn từ thù ghét</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mô tả thêm
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                  placeholder="Bạn có thể mô tả chi tiết hơn về lý do báo cáo"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isReportLoading}
                  className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReportLoading ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function ProfileSkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto grid max-w-7xl animate-pulse grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="h-[350px] w-full rounded-2xl bg-gray-200 shadow-sm"></div>
          <div className="h-[150px] w-full rounded-2xl bg-gray-200 shadow-sm"></div>
          <div className="h-[220px] w-full rounded-2xl bg-gray-200 shadow-sm"></div>
        </div>
        <div className="space-y-8">
          <div className="h-[250px] w-full rounded-2xl bg-gray-200 shadow-sm"></div>
          <div className="h-[200px] w-full rounded-2xl bg-gray-200 shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;