import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { useMyFollowing, useFollowMutations } from "../hooks/useFollow";

const FollowingPage = () => {
  const navigate = useNavigate();
  const { data: followingData, isLoading } = useMyFollowing();
  const { unfollow } = useFollowMutations();
  const users = followingData?.users || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white text-slate-500 hover:text-slate-900 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            People You Follow
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
          {isLoading ? (
            <div className="text-center text-slate-400 py-20 animate-pulse">
              Đang tải danh sách...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-slate-500 py-20 flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">
                group_off
              </span>
              <p className="text-lg font-medium text-slate-600">
                You are not following anyone yet.
              </p>
              <button
                onClick={() => navigate("/community")}
                className="mt-4 px-6 py-2 bg-yellow-50 text-yellow-700 font-bold rounded-full hover:bg-yellow-100 transition-colors"
              >
                Go find people to follow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((item, index) => {
                const user = item.followingId || item;
                const userId =
                  user._id ||
                  user.id ||
                  item.followingId?._id ||
                  item.followingId?.id;
                if (index === 0) {
                  console.log("👉 Data 1 người dùng:", item);
                  console.log("👉 ID bắt được:", userId);
                }

                return (
                  <div
                    key={userId || index}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shrink-0 ring-1 ring-slate-100"
                          style={{ backgroundImage: `url("${user.avatar}")` }}
                        />
                      ) : (
                        <div className="bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center rounded-full size-12 shrink-0 text-lg">
                          {(user.fullName || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-slate-900 font-bold line-clamp-1">
                            {user.fullName}
                          </p>
                          {user.isVerified && (
                            <BadgeCheck
                              size={16}
                              className="text-blue-500 flex-shrink-0"
                              title="Verified"
                            />
                          )}
                        </div>
                        <p className="text-slate-500 text-xs line-clamp-1">
                          {user.email || user.role || "Member"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => unfollow.mutate(userId)}
                      disabled={unfollow.isPending || !userId}
                      className="text-sm font-bold px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      Unfollow
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingPage;
