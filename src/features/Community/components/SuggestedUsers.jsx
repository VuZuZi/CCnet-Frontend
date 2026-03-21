import React from "react";

const SuggestedUsers = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
        Suggested for you
      </h3>
      <div className="space-y-4">
        {/* User 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDbPqhEHKm8qyaiKKiJR0pAjb9HVgcWXnmlpezFizU3m5BPKHzOHQKxqNp5dqMUHOzgS6zRknmxZMvLSMDcVRX6XXOy-dzmMudn8mIejLbH9XbkQqx__dmwJ-os5AJ1xNnmXHjL0TtJq08p39lZXXieklWvXfy03giMhS7uCABFRZbrQprATpORwT3Auvb_ceJzo0Vc4Uv2frs1UF6rVSvmuhteP8bCZ3aTE7ViWQC0fKasjL9j0D8irbB3_PQt26gUynSvEJfrlNPK")',
              }}
            ></div>
            <div className="flex flex-col">
              <p className="text-slate-900 text-xs font-bold">Sarah Jenkins</p>
              <p className="text-slate-400 text-[10px]">Climate Activist</p>
            </div>
          </div>
          <button className="text-primary font-bold text-xs hover:underline">
            Follow
          </button>
        </div>

        {/* User 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWatg2XpGwke4LhqR936wEmmb-nRaL__viV9IkFnIXi4FFqYGL7WETpOH-TmFslsEkm_bcIP1Dk-7RXsVSJg928GbF3znuIk6yt1N41vFgY-JsArzkf5yITwN8945rpJBMJ6L5_Dwa7tlScNUdGh046JCEFRJ-DDzyaUc6Q70ZJ27WET_IB8E0YeubOTWUVNuh1CHJVBGMl7COm9UahPn_bwy47a6koIkIR7VbEAkqNCoROF4mLQf7o4G5UXpYo8Zs_xumctAgl3nd")',
              }}
            ></div>
            <div className="flex flex-col">
              <p className="text-slate-900 text-xs font-bold">Dr. Mark Tuan</p>
              <p className="text-slate-400 text-[10px]">Medical Outreach</p>
            </div>
          </div>
          <button className="text-primary font-bold text-xs hover:underline">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestedUsers;
