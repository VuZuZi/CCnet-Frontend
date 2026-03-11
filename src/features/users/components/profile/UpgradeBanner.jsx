export function UpgradeBanner({ isOwnProfile }) {
  if (!isOwnProfile) return null; 

  return (
    <div className="bg-[#fbbf24] rounded-2xl p-6 shadow-md" data-purpose="call-to-action">
      <h2 className="text-gray-900 font-bold mb-2">Ready to make a bigger impact?</h2>
      <p className="text-gray-900 text-sm mb-5 opacity-90">
        Upgrade to an Organizer profile to start your own initiatives and manage teams.
      </p>
      <button className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors active:scale-95 duration-75">
        Upgrade Now
      </button>
    </div>
  );
}