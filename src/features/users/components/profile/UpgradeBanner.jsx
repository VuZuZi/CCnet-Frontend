import { useNavigate } from "react-router-dom";
import { useMyOrganizerRequest } from "../../hooks/useMyOrganizerRequest";

export function UpgradeBanner({ isOwnProfile }) {
  const navigate = useNavigate();
  const { request, isLoading } = useMyOrganizerRequest(isOwnProfile);

  if (!isOwnProfile) return null;

  const status = request?.status;

  const handleClick = () => {
    if (status === "PENDING" || status === "APPROVED" || status === "DECLINED") {
      navigate("/organizer/request");
      return;
    }

    navigate("/organizer/apply");
  };

  const title =
    status === "APPROVED"
      ? "You are already an Organizer"
      : status === "PENDING"
        ? "Your application is under review"
        : status === "DECLINED"
          ? "Your application needs revision"
          : "Ready to make a bigger impact?";

  const description =
    status === "APPROVED"
      ? "Your account has been approved for organizer activities."
      : status === "PENDING"
        ? "Your organizer application is being reviewed by the admin team."
        : status === "DECLINED"
          ? "Your application was declined. Review the status and submit again."
          : "Upgrade to an Organizer profile to start your own initiatives and manage teams.";

  const buttonText =
    status === "APPROVED"
      ? "View Status"
      : status === "PENDING"
        ? "Check Status"
        : status === "DECLINED"
          ? "Review Status"
          : "Upgrade Now";

  return (
    <div className="bg-[#fbbf24] rounded-2xl p-6 shadow-md" data-purpose="call-to-action">
      <h2 className="text-gray-900 font-bold mb-2">{title}</h2>
      <p className="text-gray-900 text-sm mb-5 opacity-90">
        {isLoading ? "Checking your organizer status..." : description}
      </p>

      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors active:scale-95 duration-75 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "Loading..." : buttonText}
      </button>
    </div>
  );
}

export default UpgradeBanner;