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
      ? "Bạn đã là Người tổ chức"
      : status === "PENDING"
        ? "Đơn đăng ký của bạn đang được xét duyệt"
        : status === "DECLINED"
          ? "Đơn đăng ký của bạn cần được chỉnh sửa"
          : "Bạn đã sẵn sàng tạo ra tác động lớn hơn chưa?";

  const description =
    status === "APPROVED"
      ? "Tài khoản của bạn đã được phê duyệt cho các hoạt động của người tổ chức."
      : status === "PENDING"
        ? "Đơn đăng ký người tổ chức của bạn đang được ban quản trị xét duyệt."
        : status === "DECLINED"
          ? "Đơn đăng ký của bạn đã bị từ chối. Vui lòng xem lại trạng thái và gửi lại."
          : "Nâng cấp lên hồ sơ Người tổ chức để bắt đầu các sáng kiến của riêng bạn và quản lý nhóm.";

  const buttonText =
    status === "APPROVED"
      ? "Xem trạng thái"
      : status === "PENDING"
        ? "Kiểm tra trạng thái"
        : status === "DECLINED"
          ? "Xem lại trạng thái"
          : "Nâng cấp ngay";

  return (
    <div className="bg-[#fbbf24] rounded-2xl p-6 shadow-md" data-purpose="call-to-action">
      <h2 className="text-gray-900 font-bold mb-2">{title}</h2>
      <p className="text-gray-900 text-sm mb-5 opacity-90">
        {isLoading ? "Đang kiểm tra trạng thái người tổ chức của bạn..." : description}
      </p>

      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors active:scale-95 duration-75 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "Đang tải..." : buttonText}
      </button>
    </div>
  );
}

export default UpgradeBanner;