import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useChatStore } from "@/features/chat/stores/useChatStore";
import { useCreateConversation } from "@/features/chat/hooks/conversations/useCreateConversation";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useToast } from "@/shared/contexts/ToastContext";
import {
  Wallet,
  User as UserIcon,
  Heart,
  Building2,
  ShieldCheck,
} from "lucide-react";

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
import { WalletDashboard } from "@/features/wallet/components/WalletDashboard";
import { BankAccountManager } from "@/features/bank/components/BankAccountManager";
import { DonationHistoryList } from "@/features/transaction/components/DonationHistoryList";

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
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState(null);

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
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 antialiased">
      <div className="mx-auto max-w-7xl">
        {isOwnProfile && (
          <div className="mb-8 flex gap-6 overflow-x-auto border-b border-slate-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === "profile"
                  ? "border-amber-400 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserIcon size={18} /> Hồ sơ cá nhân
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === "wallet"
                  ? "border-amber-400 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Wallet size={18} /> Ví & Thanh toán
            </button>
            <button
              onClick={() => setActiveTab("donations")}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === "donations"
                  ? "border-amber-400 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Heart size={18} /> Lịch sử ủng hộ
            </button>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300 lg:grid-cols-3">
            <section className="space-y-8 lg:col-span-2">
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
                onOpenSupportedProjects={() =>
                  navigate("/profile/supported-projects")
                }
              />
              <ImpactBadges />
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

        {activeTab === "wallet" && (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300 lg:grid-cols-3">
            <section className="space-y-8 lg:col-span-2">
              <WalletDashboard />
            </section>
            <aside className="space-y-8">
              <BankAccountManager />
            </aside>
          </div>
        )}

        {activeTab === "donations" && (
          <div className="animate-in fade-in duration-300">
            <DonationHistoryList />
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
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 animate-pulse lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="h-[350px] w-full rounded-2xl bg-gray-200 shadow-sm"></div>
          <div className="h-[150px] w-full rounded-2xl bg-gray-200 shadow-sm"></div>
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