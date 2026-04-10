import React, { useState } from "react";
import { useAuthStore } from "../../auth/stores/useAuthStore";

import ProfileWidget from "../components/sidebar/ProfileWidget";
import FeedNav from "../components/sidebar/FeedNav";
import SpotlightWidget from "../components/sidebar/SpotlightWidget";
import SuggestedUsers from "../components/sidebar/SuggestedUsers";

import PostForm from "../components/post/PostForm";
import PostFeed from "../components/post/PostFeed";
import PostTheaterMode from "../components/post/PostTheaterMode";

import ReportModal from "../components/common/ReportModal";

const CommunityPage = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [feedType, setFeedType] = useState("for-you");

  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;

  const handleOpenReport = (postId) => {
    setReportPostId(postId);
    setIsReportModalOpen(true);
  };

  const handleCloseTheater = () => {
    setSelectedPostId(null);
  };

  return (
    <div className="bg-gray-50 text-slate-900 min-h-screen pb-12">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="hidden lg:block col-span-3">
            <div className="sticky top-8 space-y-6">
              <ProfileWidget user={user} />
              <FeedNav activeFeed={feedType} onChangeFeed={setFeedType} />
            </div>
          </aside>

          <section className="col-span-12 lg:col-span-6 space-y-6">
            <PostForm currentUserId={currentUserId} />
            <PostFeed
              currentUserId={currentUserId}
              feedType={feedType}
              onReport={handleOpenReport}
              onPostClick={setSelectedPostId}
            />
          </section>

          <aside className="hidden lg:block col-span-3">
            <div className="sticky top-8 space-y-6">
              <SpotlightWidget />
              <SuggestedUsers />
            </div>
          </aside>
        </div>
      </main>

      {selectedPostId && (
        <PostTheaterMode postId={selectedPostId} onClose={handleCloseTheater} />
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={reportPostId}
      />
    </div>
  );
};

export default CommunityPage;
