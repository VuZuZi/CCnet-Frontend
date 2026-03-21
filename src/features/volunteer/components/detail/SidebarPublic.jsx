import { Heart, Users, Share2, Flag, X, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function SidebarPublic({ project }) {
    const user = useAuthStore(authSelectors.user);
    const currentAmount = project?.currentAmount || 0;
    const targetAmount = project?.targetAmount || 1;
    const progressPercent = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
    console.log(user);

    // State cho modal volunteer
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        email: user.email,
        phone: '',
        address: '',
        skills: '',
        availableHours: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Gọi API đăng ký volunteer ở đây
            console.log('Volunteer registration:', {
                ...formData,
                projectId: project?.id,
                projectName: project?.name
            });

            // Giả lập delay API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Đóng modal
            setShowVolunteerModal(false);

            // Reset form
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                address: '',
                skills: '',
                availableHours: '',
                message: ''
            });

            // Hiển thị thông báo thành công
            alert('Đăng ký tình nguyện viên thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');

        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại sau!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col gap-8">
                <div className="space-y-3">
                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {currentAmount.toLocaleString()}đ <span className="text-gray-500 text-lg font-medium">raised of {targetAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="w-full h-4 bg-purple-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full relative transition-all duration-1000" style={{ width: `${progressPercent}%` }}>
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-2xl font-bold text-gray-900">{project?.stats?.donorCount?.toLocaleString() || 0}</span>
                        <span className="text-sm font-medium text-gray-500 mt-1">Donors</span>
                    </div>
                    <div className="bg-green-100/50 p-4 rounded-2xl flex flex-col items-center justify-center border border-green-100">
                        <span className="text-2xl font-bold text-green-700">{project?.stats?.currentVolunteers?.toLocaleString() || 0}</span>
                        <span className="text-sm font-medium text-green-600 mt-1">Volunteers</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button className="w-full py-5 text-xl font-bold text-black bg-amber-400 rounded-2xl hover:bg-amber-500 transition-colors shadow-lg shadow-yellow-500/30 flex justify-center items-center gap-2">
                        <Heart className="w-6 h-6 fill-current" /> Donate Now
                    </button>

                    {/* Nút Apply to Volunteer với modal */}
                    <button
                        onClick={() => setShowVolunteerModal(true)}
                        className="w-full py-4 text-base font-bold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
                    >
                        <Users className="w-5 h-5" /> Apply to Volunteer
                    </button>
                </div>

                <hr className="border-gray-100" />

                <div className="flex justify-center gap-8">
                    <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                            <Heart className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold">Follow</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold">Share</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-yellow-600 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                            <Flag className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold">Report</span>
                    </button>
                </div>
            </div>

            {/* Modal đăng ký Volunteer */}
            {showVolunteerModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Overlay nền */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setShowVolunteerModal(false)}
                    ></div>

                    {/* Modal container */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Đăng ký tình nguyện viên
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Dự án: {project?.name || 'Chưa có tên'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowVolunteerModal(false)}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body - Form */}
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Họ và tên */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>

                                    {/* Email và Số điện thoại */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                                placeholder="example@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Số điện thoại <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                                placeholder="0123 456 789"
                                            />
                                        </div>
                                    </div>

                                    {/* Địa chỉ */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                            placeholder="Nhập địa chỉ của bạn"
                                        />
                                    </div>

                                    {/* Kỹ năng và Thời gian */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Kỹ năng <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="skills"
                                                value={formData.skills}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                            >
                                                <option value="">Chọn kỹ năng của bạn</option>
                                                <option value="teaching">Giảng dạy</option>
                                                <option value="medical">Y tế</option>
                                                <option value="construction">Xây dựng</option>
                                                <option value="communication">Truyền thông</option>
                                                <option value="event">Tổ chức sự kiện</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Thời gian rảnh <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="availableHours"
                                                value={formData.availableHours}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                            >
                                                <option value="">Chọn thời gian rảnh</option>
                                                <option value="weekend">Cuối tuần</option>
                                                <option value="weekday">Ngày trong tuần</option>
                                                <option value="flexible">Linh hoạt</option>
                                                <option value="evening">Buổi tối</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Lời nhắn */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Lời nhắn
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                                            placeholder="Chia sẻ lý do bạn muốn tham gia và mong muốn đóng góp..."
                                        />
                                    </div>

                                    {/* Nút hành động */}
                                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowVolunteerModal(false)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                'Đăng ký ngay'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}