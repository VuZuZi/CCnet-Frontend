import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/shared/components/ui/Button/Button";
import { PostFeed } from "../components/PostFeed";
import ReportModal from "../components/ReportModal";

export function CommunityPage() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const currentUserId = useAuthStore(authSelectors.userId); 
  
  const [reportPostId, setReportPostId] = useState(null);

  return (
    <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
      <div className="w-full max-w-2xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-black m-0">Community</h2>
          {isAuthenticated && (
            <Link to="/community/create" className="no-underline">
              <Button variant="yellow" className="!py-2 !px-4">Create Post</Button>
            </Link>
          )}
        </div>

        <PostFeed 
          currentUserId={currentUserId} 
          onReport={(id) => setReportPostId(id)} 
        />
      </div>
      
      <ReportModal
        isOpen={!!reportPostId}
        onClose={() => setReportPostId(null)}
        postId={reportPostId}
      />
    </div>
  );
}