import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useMyFollowing } from "../hooks/useMyFollowing";
import { useMyFollowers } from "../hooks/useMyFollowers";
import { useFollowMutations } from "../../Community/hooks/useFollow";

import { useToast } from "@/shared/contexts/ToastContext";
import { UserCard } from "../../Community/components/user/UserCard";
import { UnfollowModal } from "../../Community/components/user/UnfollowModal";

const HIGHLIGHT_DURATION_MS = 4200;
const SCROLL_DELAY_MS = 140;

export function FollowingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const limit = 50;

  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") === "followers" ? "followers" : "following";
  const highlightUserFromQuery = searchParams.get("highlightUser") || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [keyword, setKeyword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [highlightedUserId, setHighlightedUserId] = useState(
    highlightUserFromQuery ? String(highlightUserFromQuery) : null
  );
  const [isHighlightVisible, setIsHighlightVisible] = useState(
    Boolean(highlightUserFromQuery)
  );

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

  const { unfollow } = useFollowMutations();

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

  useEffect(() => {
    const tabFromQuery = searchParams.get("tab");
    const nextTab = tabFromQuery === "followers" ? "followers" : "following";
    setActiveTab(nextTab);

    const nextHighlightUser = searchParams.get("highlightUser");
    const normalizedHighlightUser = nextHighlightUser ? String(nextHighlightUser) : null;

    setHighlightedUserId(normalizedHighlightUser);
    setIsHighlightVisible(Boolean(normalizedHighlightUser));
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "followers") return;
    if (!highlightedUserId) return;
    if (isLoadingFollowers) return;

    const targetExists = followersItems.some((item) => {
      const user = item?.followerId || item;
      const currentId = user?._id || user?.id || item?._id;
      return String(currentId) === String(highlightedUserId);
    });

    if (!targetExists) return;

    const timeout = window.setTimeout(() => {
      const targetElement = document.getElementById(`connection-user-${highlightedUserId}`);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, SCROLL_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [activeTab, highlightedUserId, isLoadingFollowers, followersItems]);

  useEffect(() => {
    if (!highlightedUserId) return;

    const fadeTimeout = window.setTimeout(() => {
      setIsHighlightVisible(false);
    }, 2600);

    const cleanupTimeout = window.setTimeout(() => {
      setHighlightedUserId(null);

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("highlightUser");
      setSearchParams(nextParams, { replace: true });
    }, HIGHLIGHT_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(cleanupTimeout);
    };
  }, [highlightedUserId, searchParams, setSearchParams]);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);

    if (tab !== "followers") {
      nextParams.delete("highlightUser");
      setHighlightedUserId(null);
      setIsHighlightVisible(false);
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h1 className="mb-1 text-[28px] font-extrabold tracking-tight text-[#111827]">
            Connections
          </h1>

          <div className="relative w-full md:w-[360px]">
            <input
              type="text"
              className="w-full rounded-full border border-[#e5e7eb] py-2.5 pl-4 pr-10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              placeholder="Search name or email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              ⌕
            </span>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-6 border-b border-[#e5e7eb] px-1">
          <button
            onClick={() => handleTabChange("following")}
            className={`pb-3 text-[15px] font-bold transition-all ${
              isFollowingTab
                ? "border-b-2 border-yellow-400 text-[#111827]"
                : "border-b-2 border-transparent text-[#6b7280]"
            }`}
          >
            Following{" "}
            <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {followingItems?.length || 0}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("followers")}
            className={`pb-3 text-[15px] font-bold transition-all ${
              !isFollowingTab
                ? "border-b-2 border-yellow-400 text-[#111827]"
                : "border-b-2 border-transparent text-[#6b7280]"
            }`}
          >
            Followers{" "}
            <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {followersItems?.length || 0}
            </span>
          </button>
        </div>

        {isLoading && (
          <div className="py-10 text-center font-bold text-yellow-500">
            Loading...
          </div>
        )}

        {isError && (
          <div className="rounded-lg bg-[#f8d7da] p-4 text-[#842029]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-3">
            {filtered.length === 0 ? (
              <div className="rounded-[14px] border bg-white p-7 text-center">
                <div className="font-extrabold">No results</div>
                <div className="mt-1 text-sm text-[#6b7280]">
                  {isFollowingTab
                    ? "You are not following anyone yet."
                    : "You don't have any followers yet."}
                </div>
              </div>
            ) : (
              filtered.map((u) => {
                const isHighlightedTarget =
                  !isFollowingTab &&
                  highlightedUserId &&
                  String(u.id) === String(highlightedUserId);

                return (
                  <div
                    key={u.id}
                    id={`connection-user-${u.id}`}
                    className={`relative rounded-[18px] transition-all duration-700 ${
                      isHighlightedTarget
                        ? isHighlightVisible
                          ? "ring-2 ring-[#FBBF24] shadow-[0_12px_34px_rgba(251,191,36,0.24)]"
                          : "ring-0 shadow-none"
                        : ""
                    }`}
                  >
                    {isHighlightedTarget && (
                      <div
                        className={`pointer-events-none absolute inset-0 rounded-[18px] transition-all duration-1000 ${
                          isHighlightVisible
                            ? "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.20)_0%,rgba(255,251,235,0.55)_38%,rgba(255,255,255,0.92)_100%)] opacity-100"
                            : "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.00)_0%,rgba(255,255,255,0.00)_100%)] opacity-0"
                        }`}
                      />
                    )}

                    {isHighlightedTarget && isHighlightVisible && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px]">
                        <div className="absolute inset-[-35%] animate-[ping_1.8s_ease-out_1] rounded-[28px] border border-[#FBBF24]/45 bg-[#FBBF24]/8" />
                      </div>
                    )}

                    <div className="relative z-[1]">
                      <UserCard
                        user={u}
                        isFollowingTab={isFollowingTab}
                        onGoUser={goUser}
                        onRequestUnfollow={requestUnfollow}
                      />
                    </div>
                  </div>
                );
              })
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