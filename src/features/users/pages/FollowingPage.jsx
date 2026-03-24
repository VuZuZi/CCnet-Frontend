import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followAPI } from "../api/followAPI";
import { useMyFollowing } from "../hooks/useMyFollowing";
import { getErrorMessage } from "@/shared/lib/httpClient";
import { useToast } from "@/shared/contexts/ToastContext";
import { Button } from "@/shared/components/ui/Button/Button";

export function FollowingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const limit = 50;
  const { items, isLoading, isError, errorMessage } = useMyFollowing(limit);

  const [keyword, setKeyword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const filtered = useMemo(() => {
    const k = String(keyword || "")
      .trim()
      .toLowerCase();
    if (!k) return items;

    return (items || []).filter((u) => {
      const name = String(u.fullName || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      return name.includes(k) || email.includes(k);
    });
  }, [items, keyword]);

  const unfollowMutation = useMutation({
    mutationFn: (userId) => followAPI.unfollowUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData(["follow", "me", "following", limit], (old) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.filter((u) => String(u?.id) !== String(userId));
      });

      queryClient.invalidateQueries({
        queryKey: ["follow", "user", "status", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["follow", "user", "stats", userId],
      });

      toast.success("Unfollowed");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      setConfirmOpen(false);
      setPendingUser(null);
    },
  });

  const goUser = (u) => {
    if (!u?.id) return;
    navigate(`/users/${u.id}`, { state: { user: u } });
  };

  const requestUnfollow = (u) => {
    setPendingUser(u);
    setConfirmOpen(true);
  };

  const confirmUnfollow = () => {
    if (!pendingUser?.id) return;
    unfollowMutation.mutate(pendingUser.id);
  };

  const titleOf = (u) => u?.fullName || u?.email || "this user";

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-10 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#111827] mb-1">
              Following
            </h1>
            <p className="text-sm text-[#6b7280] m-0">
              {items?.length || 0} accounts
            </p>
          </div>

          <div className="relative w-full md:w-[360px]">
            <input
              type="text"
              className="w-full rounded-full py-2.5 pl-4 pr-10 border border-[#e5e7eb] bg-white focus:outline-none focus:ring-1 focus:border-yellow focus:ring-yellow transition-colors text-black"
              placeholder="Search name or email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none">
              ⌕
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-[14px] shadow-sm flex justify-center p-7 border border-light-gray">
            <svg
              className="animate-spin h-6 w-6 text-yellow"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-[#f8d7da] text-[#842029] p-4 rounded-lg mb-0 border border-[#f5c2c7]">
            {errorMessage || "Failed to load following list"}
          </div>
        )}

        {/* List Content */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-[14px] shadow-sm p-7 text-center border border-light-gray">
                <div className="font-extrabold text-[#111827]">No results</div>
                <div className="text-[#6b7280] mt-1.5 text-sm">
                  Try another keyword or follow someone first.
                </div>
              </div>
            ) : (
              filtered.map((u) => {
                const title = u.fullName || u.email || "Unknown";
                const letter = String(title).trim().slice(0, 1).toUpperCase();

                return (
                  <div
                    key={u.id}
                    className="bg-white rounded-[14px] shadow-sm border border-light-gray p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_10px_18px_rgba(17,24,39,0.08)] cursor-pointer"
                    onClick={() => goUser(u)}
                    role="button"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-[#f3f4f6] flex items-center justify-center font-black text-[#111827]">
                        {u.avatar ? (
                          <img
                            className="w-full h-full object-cover"
                            src={u.avatar}
                            alt={title}
                          />
                        ) : (
                          letter
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-[#111827] truncate leading-tight mb-0.5">
                          {title}
                        </div>
                        <div className="text-[13px] text-[#6b7280] truncate">
                          {u.email || ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <Button
                        variant="danger"
                        className="!py-1.5 !px-4 !text-sm"
                        disabled={unfollowMutation.isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          requestUnfollow(u);
                        }}
                      >
                        Unfollow
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Custom Modal for Unfollow Confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-light-gray flex justify-between items-center bg-white">
              <h3 className="font-bold text-lg text-black m-0">Unfollow</h3>
              {!unfollowMutation.isPending && (
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    setPendingUser(null);
                  }}
                  className="text-gray hover:text-black bg-transparent border-none text-2xl leading-none cursor-pointer focus:outline-none"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="p-6 text-black bg-white">
              Are you sure you want to unfollow{" "}
              <strong>{titleOf(pendingUser)}</strong>?
            </div>

            <div className="px-6 py-4 border-t border-light-gray bg-off-white flex justify-end gap-3 rounded-b-xl">
              <Button
                variant="secondary"
                disabled={unfollowMutation.isPending}
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingUser(null);
                }}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                isLoading={unfollowMutation.isPending}
                onClick={confirmUnfollow}
              >
                Unfollow
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FollowingPage;
