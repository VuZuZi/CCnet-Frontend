import { useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useChatStore } from '@/features/chat/stores/useChatStore';
import { useCreateConversation } from '@/features/chat/hooks/conversations/useCreateConversation';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { Building2, Heart, Wallet } from 'lucide-react';
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

  const { isFollowing } = useFollowUserStatus(isOwnProfile ? null : targetUserId);
  const { toggle, isLoading: isToggleLoading } = useToggleFollowUser(targetUserId);

  const openConversation = useChatStore((s) => s.openConversation);
  const focusConversation = useChatStore((s) => s.focusConversation);
  const { createConversationAsync, isLoading: isChatLoading } = useCreateConversation();
  const { mutateAsync: reportUser, isPending: isReportLoading } = useReportUser();
  const { data: supportedProjectsData } = useSupportedProjects({ page: 1, limit: 1, view: 'ALL' }, isOwnProfile);

  const supportedCount = supportedProjectsData?.summary?.totalSupported || 0;
  const profileUserId = isOwnProfile ? currentUserId : targetUserId;

  const handleOpenChat = async () => {
    if (isOwnProfile || !targetUserId) return;
    try {
      const convo = await createConversationAsync({ participantId: targetUserId });
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
      toast.error('Vui lòng đăng nhập để báo cáo người dùng');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setReportError(null);
    setReportReason("");
    setReportDescription("");
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (event) => {
    event.preventDefault();
    if (!targetUserId) return setReportError('Không tìm thấy người dùng để báo cáo.');
    if (!reportReason) return setReportError('Vui lòng chọn lý do báo cáo.');

    try {
      await reportUser({
        userId: targetUserId,
        payload: { reason_code: reportReason, description: reportDescription.trim() },
      });
      setReportModalOpen(false);
    } catch (error) {
      setReportError(error.response?.data?.message || 'Gửi báo cáo thất bại.');
    }
  };

  if (!isAuthReady || isProfileLoading) return <ProfileSkeletonLoader />;

  if (isError || !userProfile) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-900">
        <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy hồ sơ</h2>
        <p className="text-gray-500 mt-2">Người dùng bạn đang tìm kiếm không tồn tại hoặc đã xảy ra lỗi.</p>
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
                <p className="mt-1 text-sm text-slate-500">Quản lý ngân hàng, ví và ủng hộ theo từng nhóm để thao tác nhanh hơn.</p>
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
                  <p className="mt-1 text-xs font-medium text-slate-500">Đăng ký tài khoản nhận tiền</p>
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
                  <p className="mt-1 text-xs font-medium text-slate-500">Số dư, rút tiền, sao kê ví</p>
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
                  <p className="mt-1 text-xs font-medium text-slate-500">Các khoản đã ủng hộ & hoàn tiền</p>
                </button>
              </div>
            </div>

            {financeTab === 'bank' ? <BankAccountManager /> : null}
            {financeTab === 'wallet' ? <WalletDashboard /> : null}
            {financeTab === 'donation' ? <DonationHistoryList /> : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 space-y-8">
              <ProfileHeroCard
                user={userProfile}
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
                isOwnProfile={isOwnProfile}
                onOpenSupportedProjects={() => navigate('/profile/supported-projects')}
              />

              <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">Bài đăng của {isOwnProfile ? 'bạn' : 'người dùng này'}</h2>
                  <p className="mt-1 text-sm text-slate-500">Dòng thời gian cá nhân theo thứ tự mới nhất.</p>
                </div>

                <PostFeed
                  currentUserId={currentUserId}
                  onReport={(postId) => navigate(`/community/${postId}`)}
                  feedType="profile"
                  profileUserId={profileUserId}
                  emptyMessage="Chưa có bài đăng nào trong tường cá nhân."
                />
              </article>
            </section>

            <aside className="space-y-8">
              <AboutMeCard about={userProfile.about} level={userProfile.level} title={userProfile.title} createdAt={userProfile.createdAt} />
              <SkillsSection skills={userProfile.skills} />
              <UpgradeBanner isOwnProfile={isOwnProfile} />
            </aside>
          </div>
        )}

      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Báo cáo người dùng</h3>
                <p className="text-sm text-slate-500">Gửi báo cáo đến admin để kiểm duyệt tài khoản này.</p>
              </div>
              <button type="button" onClick={() => setReportModalOpen(false)} className="text-2xl font-bold text-slate-400 hover:text-slate-700">×</button>
            </div>
            <form className="space-y-5 px-6 py-6" onSubmit={handleSubmitReport}>
              {reportError && <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">{reportError}</div>}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Lý do báo cáo</label>
                <select value={reportReason} onChange={(e) => { setReportReason(e.target.value); setReportError(null); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100">
                  <option value="">Chọn lý do</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Quấy rối</option>
                  <option value="inappropriate">Không phù hợp</option>
                  <option value="violence">Bạo lực</option>
                  <option value="hate_speech">Ngôn từ kích động thù địch</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả thêm (tùy chọn)</label>
                <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100" placeholder="Bạn có thể mô tả chi tiết hơn về lý do báo cáo" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setReportModalOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={isReportLoading} className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed">{isReportLoading ? 'Đang gửi...' : 'Gửi báo cáo'}</button>
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