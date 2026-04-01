// src/features/volunteer/components/tabPending.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useVolunteerQueries } from '@/features/volunteer/hooks/useVolunteerQueries';
import { useVolunteerMutations } from '@/features/volunteer/hooks/useVolunteerMutations';

export const TabPending = ({ projectId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    // Lấy danh sách đơn đang chờ
    const { useProjectPendingApplications } = useVolunteerQueries();
    const { data, isLoading, error, refetch } = useProjectPendingApplications(projectId);

    useEffect(() => {
        if (data) {
            // Kiểm tra cấu trúc
            if (data && typeof data === 'object') {
                console.log(' Data keys:', Object.keys(data));
                // Kiểm tra các trường có thể chứa mảng
                if (data.data) {
                    console.log(' data.data:', data.data);
                    console.log(' data.data is array?', Array.isArray(data.data));
                }
                if (data.applications) {
                    console.log(' data.applications:', data.applications);
                }
            }
        }
        if (error) {
            console.error('❌ Error:', error);
        }
    }, [data, error]);

    // ✅ Lấy applications từ nhiều cấu trúc khác nhau
    const getApplications = () => {
        if (!data) return [];

        // Nếu data là mảng trực tiếp
        if (Array.isArray(data)) return data;

        // Nếu data.data là mảng
        if (data.data && Array.isArray(data.data)) return data.data;

        // Nếu data.applications là mảng
        if (data.applications && Array.isArray(data.applications)) return data.applications;

        // Nếu data.data.data là mảng
        if (data.data && data.data.data && Array.isArray(data.data.data)) return data.data.data;

        // Nếu data có success và data
        if (data.success && data.data && Array.isArray(data.data)) return data.data;

        console.warn('⚠️ Unknown data structure, returning empty array');
        return [];
    };

    const applications = getApplications();
    const { updateApplication, isUpdating } = useVolunteerMutations();
    const handleApprove = (applicationId) => {
        if (confirm('Xác nhận duyệt đơn đăng ký này?')) {
            updateApplication(
                { id: applicationId, data: { status: 'APPROVED' } },
                {
                    onSuccess: () => {
                        refetch();
                    },
                    onError: (error) => {
                        alert(error.response?.data?.message || 'Duyệt đơn thất bại');
                    }
                }
            );
        }
    };

    const handleReject = (applicationId) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (reason && reason.trim()) {
            updateApplication(
                { id: applicationId, data: { status: 'REJECTED', rejectReason: reason } },
                {
                    onSuccess: () => {
                        refetch();
                        alert('Từ chối đơn thành công');
                    },
                    onError: (error) => {
                        alert(error.response?.data?.message || 'Từ chối đơn thất bại');
                    }
                }
            );
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <div className="text-center py-8">
                    <p className="text-red-500 mb-2">Có lỗi xảy ra</p>
                    <p className="text-sm text-gray-500">{error.message}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Kiểm tra applications là mảng trước khi dùng slice
    if (!applications || !Array.isArray(applications) || applications.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <p className="text-center text-gray-500 py-8">
                    Hiện không có đơn đăng ký nào đang chờ
                </p>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => refetch()}
                        className="text-sm text-blue-500 hover:text-blue-600"
                    >
                        Làm mới
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-amber-50">
                <h3 className="text-lg font-bold text-amber-800">Đơn đăng ký đang chờ xét duyệt</h3>
                <p className="text-sm text-amber-600 mt-1">
                    Có {applications.length} đơn đang chờ
                </p>
            </div>

            <div className="divide-y divide-gray-100">
                {(isExpanded ? applications : applications.slice(0, 3)).map((app) => (
                    <div key={app._id || app.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <span className="text-amber-600 font-bold">
                                            {app.volunteerId?.fullName?.charAt(0) ||
                                                app.volunteer?.fullName?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {app.volunteerId?.fullName || app.volunteer?.fullName || 'Unknown'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {app.volunteerId?.email || app.volunteer?.email || ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Kỹ năng:</span>
                                        <p className="font-medium text-gray-700 mt-1">{app.skills}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Thời gian:</span>
                                        <p className="font-medium text-gray-700 mt-1">{app.availability}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Động lực:</span>
                                        <p className="text-gray-700 mt-1 line-clamp-2">{app.motivation}</p>
                                        {app.motivation?.length > 100 && (
                                            <button
                                                onClick={() => setSelectedApp(selectedApp === app._id ? null : app._id)}
                                                className="text-xs text-amber-600 hover:text-amber-700 mt-1"
                                            >
                                                {selectedApp === app._id ? 'Thu gọn' : 'Xem thêm'}
                                            </button>
                                        )}
                                        {selectedApp === app._id && (
                                            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{app.motivation}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Ngày đăng ký:</span>
                                        <p className="text-gray-700">
                                            {format(new Date(app.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => handleApprove(app._id || app.id)}
                                    disabled={isUpdating}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Duyệt"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleReject(app._id || app.id)}
                                    disabled={isUpdating}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Từ chối"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {isUpdating && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                                <Clock className="w-4 h-4 animate-spin" />
                                Đang xử lý...
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {applications.length > 3 && (
                <div className="p-4 border-t border-gray-100 flex justify-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                Thu gọn <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Xem thêm {applications.length - 3} đơn <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};