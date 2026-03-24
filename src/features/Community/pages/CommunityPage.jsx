import React, { useState } from "react";
import { useAuthStore } from "../../auth/stores/useAuthStore";

import ProfileWidget from "../components/ProfileWidget";
import FeedNav from "../components/FeedNav";
import CommunityList from "../components/CommunityList";
import PostForm from "../components/PostForm";
import PostFeed from "../components/PostFeed";
import SpotlightWidget from "../components/SpotlightWidget";
import SuggestedUsers from "../components/SuggestedUsers";
import ReportModal from "../components/ReportModal";
// 1. Import component Theater Mode mới
import PostTheaterMode from "../components/PostTheaterMode";

const CommunityPage = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);

  // 2. State quản lý việc mở chi tiết bài viết (Theater Mode)
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;

  const handleOpenReport = (postId) => {
    setReportPostId(postId);
    setIsReportModalOpen(true);
  };

  // Hàm đóng Theater Mode
  const handleCloseTheater = () => {
    setSelectedPostId(null);
    // Cập nhật lại URL nếu bạn muốn (tùy chọn)
  };

  return (
    <div className="bg-gray-50 text-slate-900 min-h-screen pb-12">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Trái */}
          <aside className="hidden lg:block col-span-3">
            <div className="sticky top-8 space-y-6">
              <ProfileWidget user={user} />
              <FeedNav />
              <CommunityList />
            </div>
          </aside>

          {/* Nội dung chính (Feed) */}
          <section className="col-span-12 lg:col-span-6 space-y-6">
            <PostForm currentUserId={currentUserId} />
            <PostFeed
              currentUserId={currentUserId}
              onReport={handleOpenReport}
              // 3. Truyền hàm mở bài viết vào Feed
              onPostClick={(postId) => setSelectedPostId(postId)}
            />
          </section>

          {/* Sidebar Phải */}
          <aside className="hidden lg:block col-span-3">
            <div className="sticky top-8 space-y-6">
              <SpotlightWidget />
              <SuggestedUsers />
            </div>
          </aside>
        </div>
      </main>

      {/* --- CÁC MODAL LỚP TRÊN CÙNG --- */}

      {/* 4. Hiển thị Theater Mode khi có selectedPostId */}
      {selectedPostId && (
        <PostTheaterMode postId={selectedPostId} onClose={handleCloseTheater} />
      )}

      {/* Modal Báo cáo */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={reportPostId}
      />
    </div>
  );
};

export default CommunityPage;
