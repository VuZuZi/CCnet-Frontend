import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useChatStore } from '@/features/chat/stores/useChatStore';
import { useCreateConversation } from '@/features/chat/hooks/conversations/useCreateConversation';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { Wallet, User as UserIcon, Heart } from 'lucide-react'; // Đã thêm icon Heart

import { useProfileIdentity } from "../hooks/useProfileIdentity";
import { useProfile } from "../hooks/useProfile";
import { useFollowUserStatus } from "../hooks/useFollowUserStatus";
import { useToggleFollowUser } from "../hooks/useToggleFollowUser";
import { useReportUser } from "../hooks/useReportUser";
import { useSupportedProjects } from "@/features/volunteer/hooks/useSupportedProjects";

import { ProfileHeroCard } from "../components/profile/ProfileHeroCard";
import { ImpactMetrics } from "../components/profile/ImpactMetrics";
import { ImpactBadges } from "../components/profile/ImpactBadges";
import { AboutMeCard } from "../components/profile/AboutMeCard";
import { SkillsSection } from "../components/profile/SkillsSection";
import { UpgradeBanner } from "../components/profile/UpgradeBanner";
import { WalletDashboard } from '@/features/wallet/components/WalletDashboard';
import { BankAccountManager } from '@/features/bank/components/BankAccountManager';
import { DonationHistoryList } from '@/features/transaction/components/DonationHistoryList';

export function UserProfilePage() {
  const { id: urlId } = useParams();

  const { isOwnProfile, targetUserId, isAuthReady } = useProfileIdentity(urlId);
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState(null);

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

        {isOwnProfile && (
          <div className="mb-8 flex gap-6 border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'profile'
                  ? 'border-amber-400 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <UserIcon size={18} /> Hồ sơ cá nhân
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'wallet'
                  ? 'border-amber-400 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <Wallet size={18} /> Ví & Thanh toán
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'donations' 
                  ? 'border-amber-400 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <Heart size={18} /> Lịch sử ủng hộ
            </button>
          </div>
        )}

        {/* Nội dung tương ứng với các tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
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
              <ImpactBadges />
            </section>

            <aside className="space-y-8">
              <AboutMeCard about={userProfile.about} level={userProfile.level} title={userProfile.title} createdAt={userProfile.createdAt} />
              <SkillsSection skills={userProfile.skills} />
              <UpgradeBanner isOwnProfile={isOwnProfile} />
            </aside>
          </div>
        )}
        
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <section className="lg:col-span-2 space-y-8">
              <WalletDashboard />
            </section>
            <aside className="space-y-8">
              <BankAccountManager />
            </aside>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="animate-in fade-in duration-300">
            <DonationHistoryList />
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