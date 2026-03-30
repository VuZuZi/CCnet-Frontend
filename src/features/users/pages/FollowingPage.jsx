import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMyFollowing } from "../hooks/useMyFollowing";
import { useMyFollowers } from "../hooks/useMyFollowers";
import { useFollowMutations } from "../../Community/hooks/useFollow";

import { useToast } from "@/shared/contexts/ToastContext";
import { UserCard } from "../../Community/components/UserCard";
import { UnfollowModal } from "../../Community/components/UnfollowModal";

export function FollowingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const limit = 50;

  const [activeTab, setActiveTab] = useState("following");
  const [keyword, setKeyword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // 1. GỌI DATA
  const {
    items: followingItems,
    isLoading: isLoadingFollowing,
    isError: isErrFollow,
    errorMessage: msgFollow,
  } = useMyFollowing(limit);
  const {
    items: followersItems,
    isLoading: isLoadingFollowers,
    isError: isErrFollower,
    errorMessage: msgFollower,
  } = useMyFollowers(limit);

  // 2. LẤY HÀM UNFOLLOW TỪ HOOK CHUẨN
  const { unfollow } = useFollowMutations();

  // 3. XỬ LÝ LOGIC TAB
  const isFollowingTab = activeTab === "following";
  const rawItems = isFollowingTab ? followingItems : followersItems;
  const isLoading = isFollowingTab ? isLoadingFollowing : isLoadingFollowers;
  const isError = isFollowingTab ? isErrFollow : isErrFollower;
  const errorMessage = isFollowingTab ? msgFollow : msgFollower;

  const items = (rawItems || []).map((item) => {
    const user = item.followingId || item.followerId || item;
    return { ...user, id: user._id || user.id || item._id };
  });

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return items;
    return items.filter((u) => {
      return (
        String(u.fullName || "")
          .toLowerCase()
          .includes(k) ||
        String(u.email || "")
          .toLowerCase()
          .includes(k)
      );
    });
  }, [items, keyword]);

  // 4. CÁC HÀM XỬ LÝ SỰ KIỆN
  const goUser = (u) =>
    u?.id && navigate(`/users/${u.id}`, { state: { user: u } });

  const requestUnfollow = (u) => {
    setPendingUser(u);
    setConfirmOpen(true);
  };

  const confirmUnfollow = () => {
    if (!pendingUser?.id) return;
    unfollow.mutate(pendingUser.id, {
      onSuccess: () => {
        toast.success("Unfollowed successfully");
        setConfirmOpen(false);
        setPendingUser(null);
      },
      onError: () => toast.error("Failed to unfollow"),
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-10 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111827] mb-1">
            Connections
          </h1>
          <div className="relative w-full md:w-[360px]">
            <input
              type="text"
              className="w-full rounded-full py-2.5 pl-4 pr-10 border border-[#e5e7eb] focus:ring-1 focus:border-yellow-400 focus:ring-yellow-400"
              placeholder="Search name or email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              ⌕
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[#e5e7eb] mb-6 px-1">
          <button
            onClick={() => setActiveTab("following")}
            className={`pb-3 font-bold text-[15px] border-b-2 transition-all ${isFollowingTab ? "border-yellow-400 text-[#111827]" : "border-transparent text-[#6b7280]"}`}
          >
            Following{" "}
            <span className="ml-1.5 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
              {followingItems?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("followers")}
            className={`pb-3 font-bold text-[15px] border-b-2 transition-all ${!isFollowingTab ? "border-yellow-400 text-[#111827]" : "border-transparent text-[#6b7280]"}`}
          >
            Followers{" "}
            <span className="ml-1.5 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
              {followersItems?.length || 0}
            </span>
          </button>
        </div>

        {/* Trạng thái Loading / Error */}
        {isLoading && (
          <div className="text-center py-10 font-bold text-yellow-500">
            Loading...
          </div>
        )}
        {isError && (
          <div className="bg-[#f8d7da] text-[#842029] p-4 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* List Content */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-[14px] p-7 text-center border">
                <div className="font-extrabold">No results</div>
                <div className="text-[#6b7280] text-sm mt-1">
                  {isFollowingTab
                    ? "You are not following anyone yet."
                    : "You don't have any followers yet."}
                </div>
              </div>
            ) : (
              filtered.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  isFollowingTab={isFollowingTab}
                  onGoUser={goUser}
                  onRequestUnfollow={requestUnfollow}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal tách rời */}
      <UnfollowModal
        isOpen={confirmOpen}
        user={pendingUser}
        isPending={unfollow.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmUnfollow}
      />
    </div>
  );
}

export default FollowingPage;
