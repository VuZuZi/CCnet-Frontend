import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useMyFollowing } from "../hooks/useMyFollowing";
import { useMyFollowers } from "../hooks/useMyFollowers";
import { useFollowMutations } from "../../Community/hooks/useFollow";

import { useToast } from "@/shared/contexts/ToastContext";
import { UserCard } from "../../Community/components/user/UserCard";
import { UnfollowModal } from "../../Community/components/user/UnfollowModal";
import { ProjectCard } from "../../project/components/ProjectCard";

export function FollowingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const limit = 50;

  const [activeTab, setActiveTab] = useState("following");
  const [keyword, setKeyword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const {
    items: followingItems,
    isLoading: isLoadFollowing,
    isError: isErrFollowing,
    errorMessage: msgFollowing,
  } = useMyFollowing(limit, "user");

  const {
    items: followerItems,
    isLoading: isLoadFollowers,
    isError: isErrFollower,
    errorMessage: msgFollower,
  } = useMyFollowers(limit);

  const {
    items: projectItems,
    isLoading: isLoadProjects,
    isError: isErrProjects,
    errorMessage: msgProjects,
  } = useMyFollowing(limit, "project");

  const { unfollow } = useFollowMutations();

  let rawItems = [];
  let isLoading = false;
  let isError = false;
  let errorMessage = null;

  if (activeTab === "following") {
    rawItems = followingItems;
    isLoading = isLoadFollowing;
    isError = isErrFollowing;
    errorMessage = msgFollowing;
  } else if (activeTab === "followers") {
    rawItems = followerItems;
    isLoading = isLoadFollowers;
    isError = isErrFollower;
    errorMessage = msgFollower;
  } else if (activeTab === "projects") {
    rawItems = projectItems;
    isLoading = isLoadProjects;
    isError = isErrProjects;
    errorMessage = msgProjects;
  }

  const normalizedItems = useMemo(() => {
    if (!rawItems || rawItems.length === 0) return [];

    if (activeTab === "projects") {
      return rawItems
        .map((item) => {
          if (item.fullName || item.email || item.username) return null;

          const project = item.projectId || item;
          if (!project) return null;

          return {
            ...(typeof project === "object" ? project : {}),
            _id:
              project._id ||
              project.id ||
              (typeof project === "string" ? project : undefined),
          };
        })
        .filter((p) => p && p._id);
    }

    return rawItems
      .map((item) => {
        const user = item.followingId || item.followerId || item;
        if (!user) return null;
        return { ...user, id: user._id || user.id || item._id };
      })
      .filter((u) => u && u.id);
  }, [rawItems, activeTab]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return normalizedItems;

    return normalizedItems.filter((item) => {
      if (activeTab === "projects") {
        return String(item.title || "")
          .toLowerCase()
          .includes(k);
      }
      return (
        String(item.fullName || "")
          .toLowerCase()
          .includes(k) ||
        String(item.email || "")
          .toLowerCase()
          .includes(k)
      );
    });
  }, [normalizedItems, keyword, activeTab]);

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
        toast.success("Bỏ theo dõi thành công");
        setConfirmOpen(false);
        setPendingUser(null);
      },
      onError: () => toast.error("Bỏ theo dõi thất bại"),
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h1 className="mb-1 text-[28px] font-extrabold tracking-tight text-[#111827]">
            Kết nối
          </h1>

          <div className="relative w-full md:w-[360px]">
            <input
              type="text"
              className="w-full rounded-full py-2.5 pl-4 pr-10 border border-[#e5e7eb] focus:ring-1 focus:border-yellow-400 focus:ring-yellow-400"
              placeholder={
                activeTab === "projects"
                  ? "Tìm kiếm dự án..."
                  : "Tìm kiếm tên hoặc email..."
              }
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              ⌕
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-[#e5e7eb] mb-6 px-1 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("following")}
            className={`pb-3 font-bold text-[15px] border-b-2 transition-all ${activeTab === "following" ? "border-yellow-400 text-[#111827]" : "border-transparent text-[#6b7280]"}`}
          >
            Đang theo dõi{" "}
            <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {followingItems?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("followers")}
            className={`pb-3 font-bold text-[15px] border-b-2 transition-all ${activeTab === "followers" ? "border-yellow-400 text-[#111827]" : "border-transparent text-[#6b7280]"}`}
          >
            Người theo dõi{" "}
            <span className="ml-1.5 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
              {followerItems?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-3 font-bold text-[15px] border-b-2 transition-all ${activeTab === "projects" ? "border-yellow-400 text-[#111827]" : "border-transparent text-[#6b7280]"}`}
          >
            Dự án{" "}
            <span className="ml-1.5 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
              {projectItems?.length || 0}
            </span>
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-10 font-bold text-yellow-500 animate-pulse">
            Đang tải danh sách...
          </div>
        )}

        {isError && (
          <div className="rounded-lg bg-[#f8d7da] p-4 text-[#842029]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !isError && (
          <div
            className={`${activeTab === "projects" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-3"}`}
          >
            {filtered.length === 0 ? (
              <div className="bg-white rounded-[14px] p-7 text-center border col-span-full">
                <div className="font-extrabold">Không có kết quả</div>
                <div className="text-[#6b7280] text-sm mt-1">
                  {activeTab === "following" &&
                    "Bạn chưa theo dõi ai."}
                  {activeTab === "followers" &&
                    "Bạn chưa có người theo dõi nào."}
                  {activeTab === "projects" &&
                    "Bạn chưa theo dõi dự án nào."}
                </div>
              </div>
            ) : activeTab === "projects" ? (
              filtered.map((p) => <ProjectCard key={p._id} project={p} />)
            ) : (
              filtered.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  isFollowingTab={activeTab === "following"}
                  onGoUser={goUser}
                  onRequestUnfollow={requestUnfollow}
                />
              ))
            )}
          </div>
        )}
      </div>

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