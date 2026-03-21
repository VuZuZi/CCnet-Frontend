import React, { useState } from "react";

// Đảm bảo đường dẫn này trỏ đúng tới file useAuthStore.js của bạn
import { useAuthStore } from "../../auth/stores/useAuthStore";

import ProfileWidget from "../components/ProfileWidget";
import FeedNav from "../components/FeedNav";
import CommunityList from "../components/CommunityList";
import PostForm from "../components/PostForm";
import PostFeed from "../components/PostFeed";
import SpotlightWidget from "../components/SpotlightWidget";
import SuggestedUsers from "../components/SuggestedUsers";
import ReportModal from "../components/ReportModal";

const CommunityPage = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);

  const { user } = useAuthStore();

  const currentUserId = user?._id || user?.id;

  const handleOpenReport = (postId) => {
    setReportPostId(postId);
    setIsReportModalOpen(true);
  };

  return (
    <div className="bg-gray-50 text-slate-900 min-h-screen pb-12">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="hidden lg:block col-span-3 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* ProfileWidget có thể bị lỗi nếu nó không nhận prop user.
                  Tạm thời bạn có thể đổi thành <ProfileWidget /> nếu bị lỗi. */}
              <ProfileWidget user={user} />
              <FeedNav />
              <CommunityList />
            </div>
          </aside>

          <section className="col-span-12 lg:col-span-6 space-y-6">
            <PostForm currentUserId={currentUserId} />
            <PostFeed
              currentUserId={currentUserId}
              onReport={handleOpenReport}
            />
          </section>

          <aside className="hidden lg:block col-span-3 space-y-6">
            <div className="sticky top-8 space-y-6">
              <SpotlightWidget />
              <SuggestedUsers />
            </div>
          </aside>
        </div>
      </main>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={reportPostId}
      />
    </div>
  );
};

export default CommunityPage;
