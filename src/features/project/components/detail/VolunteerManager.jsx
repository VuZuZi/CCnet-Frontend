// src/features/project/components/detail/VolunteerManager.jsx
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useVolunteerQueries } from '@/features/volunteer/hooks/useVolunteerQueries';
import { useVolunteerMutations } from '@/features/volunteer/hooks/useVolunteerMutations';

export const VolunteerManager = ({ projectId }) => {
    const [activeSubTab, setActiveSubTab] = useState('pending');
    const [selectedApp, setSelectedApp] = useState(null);
    console.log("ssssssssssssssss"+ projectId)
    // Lấy danh sách đơn theo trạng thái
    const { useProjectApplications } = useVolunteerQueries();
    const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } =
        useProjectApplications(projectId, 'PENDING');
    const { data: activeData, isLoading: activeLoading } =
        useProjectApplications(projectId, 'APPROVED');

    const { updateApplication } = useVolunteerMutations();

    const handleApprove = (applicationId) => {
        if (confirm('Xác nhận duyệt đơn đăng ký này?')) {
            updateApplication(
                { id: applicationId, data: { status: 'APPROVED' } },
                { onSuccess: () => refetchPending() }
            );
        }
    };

    const handleReject = (applicationId) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (reason && reason.trim()) {
            updateApplication(
                { id: applicationId, data: { status: 'REJECTED', rejectReason: reason } },
                { onSuccess: () => refetchPending() }
            );
        }
    };

    const pendingApps = pendingData?.data?.data || pendingData?.data || [];
    const activeApps = activeData?.data?.data || activeData?.data || [];

    const applications = activeSubTab === 'pending' ? pendingApps : activeApps;
    const isLoading = activeSubTab === 'pending' ? pendingLoading : activeLoading;

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sub Tabs */}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-full w-max">
                <button
                    onClick={() => setActiveSubTab('pending')}
                    className={`px-5 py-2 text-sm font-bold rounded-full shadow-sm transition-all ${
                        activeSubTab === 'pending'
                            ? 'bg-white text-gray-900'
                            : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                    Pending Applications ({pendingApps.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('active')}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                        activeSubTab === 'active'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                    Active Team ({activeApps.length})
                </button>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {applications.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
                        <p className="text-gray-500">
                            {activeSubTab === 'pending'
                                ? 'Hiện không có đơn đăng ký nào đang chờ'
                                : 'Hiện chưa có thành viên nào trong đội tình nguyện'}
                        </p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {app.volunteerId?.avatar ? (
                                        <img
                                            src={app.volunteerId.avatar}
                                            alt={app.volunteerId?.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-amber-200 text-amber-700 font-bold text-xl">
                                            {app.volunteerId?.fullName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-2 w-full">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {app.volunteerId?.fullName || 'Unknown'}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Applied {format(new Date(app.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md">
                                            {app.skills === 'field_planting' ? 'Field Planting' :
                                                app.skills === 'logistics' ? 'Logistics' :
                                                    app.skills === 'education' ? 'Education' : 'Data'}
                                        </span>
                                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-md">
                                            {app.availability}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 italic">
                                        "{app.motivation?.length > 100 ? app.motivation.substring(0, 100) + '...' : app.motivation}"
                                    </p>

                                    <button
                                        onClick={() => setSelectedApp(selectedApp === app._id ? null : app._id)}
                                        className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        View Full Application
                                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>

                                    {selectedApp === app._id && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {app.motivation}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Availability: {app.availability}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons - chỉ hiển thị ở tab pending */}
                                {activeSubTab === 'pending' && (
                                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                        <button
                                            onClick={() => handleApprove(app._id)}
                                            className="flex-1 sm:flex-none py-2 px-6 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(app._id)}
                                            className="flex-1 sm:flex-none py-2 px-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};