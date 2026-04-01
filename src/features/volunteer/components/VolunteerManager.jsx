// src/features/project/components/detail/VolunteerManager.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useVolunteerQueries } from '@/features/volunteer/hooks/useVolunteerQueries.js';
import { useVolunteerMutations } from '@/features/volunteer/hooks/useVolunteerMutations.js';

export const VolunteerManager = ({ projectId, initialSubTab = 'pending' }) => {
    const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

    // ✅ Update state when prop changes
    useEffect(() => {
        if (initialSubTab) {
            setActiveSubTab(initialSubTab);
        }
    }, [initialSubTab]);

    const [selectedApp, setSelectedApp] = useState(null);

    const { useProjectApplications } = useVolunteerQueries();

    // ✅ Lấy dữ liệu cho 3 status
    const { data: pendingResult, isLoading: pendingLoading, refetch: refetchPending } =
        useProjectApplications(projectId, 'PENDING');
    const { data: approvedResult, isLoading: approvedLoading, refetch: refetchApproved } =
        useProjectApplications(projectId, 'APPROVED');
    const { data: rejectedResult, isLoading: rejectedLoading, refetch: refetchRejected } =
        useProjectApplications(projectId, 'REJECTED');

    const getApplicationsArray = (result) => {
        if (!result) return [];
        if (result.data && Array.isArray(result.data)) return result.data;
        if (Array.isArray(result)) return result;
        if (result.data && result.data.data && Array.isArray(result.data.data)) return result.data.data;
        return [];
    };

    const pendingApps = getApplicationsArray(pendingResult);
    const approvedApps = getApplicationsArray(approvedResult);
    const rejectedApps = getApplicationsArray(rejectedResult);

    // ✅ Chọn dữ liệu theo tab
    const getApplicationsByTab = () => {
        switch (activeSubTab) {
            case 'pending': return pendingApps;
            case 'approved': return approvedApps;
            case 'rejected': return rejectedApps;
            default: return [];
        }
    };

    const getLoadingByTab = () => {
        switch (activeSubTab) {
            case 'pending': return pendingLoading;
            case 'approved': return approvedLoading;
            case 'rejected': return rejectedLoading;
            default: return false;
        }
    };

    const applications = getApplicationsByTab();
    const isLoading = getLoadingByTab();

    const {
        approveApplication,
        rejectApplication,
        restoreApplication
    } = useVolunteerMutations();

    // ✅ Approve: PENDING -> APPROVED
    const handleApprove = (applicationId) => {
        console.log('🔍 ===== HANDLE APPROVE =====');
        console.log('📥 Received applicationId:', applicationId);
        console.log('📥 Type:', typeof applicationId);
        console.log('📥 Is valid:', applicationId && applicationId.length === 24);

        if (!applicationId) {
            console.error('❌ applicationId is undefined or null');
            alert('Không tìm thấy ID đơn đăng ký');
            return;
        }

        if (confirm('Xác nhận duyệt đơn đăng ký này?')) {
            console.log('📤 Calling approveApplication with:', applicationId);
            approveApplication({ id: applicationId}, {
                onSuccess: () => {
                    console.log('✅ Approve success');
                    refetchPending();
                    refetchApproved();
                    alert('Duyệt đơn thành công');
                },
                onError: (error) => {
                    console.error('❌ Approve error:', error);
                    alert(error.response?.data?.message || 'Duyệt đơn thất bại');
                }
            });
        }
    };
    // ✅ Reject: PENDING -> REJECTED
    const handleReject = (applicationId) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (reason && reason.trim()) {
            //  Dùng rejectApplication (đúng tên)
            rejectApplication(
                { id: applicationId, reason: reason.trim() },
                {
                    onSuccess: () => {
                        refetchPending();
                        refetchRejected();
                        alert('Từ chối đơn thành công');
                    },
                    onError: (error) => {
                        alert(error.response?.data?.message || 'Từ chối đơn thất bại');
                    }
                }
            );
        }
    };

    //  Restore: REJECTED -> PENDING
    const handleRestore = (applicationId) => {
        if (confirm('Xác nhận khôi phục đơn đăng ký này?')) {
            // ✅ Đúng format: { id, data: { status: 'PENDING' } }
            restoreApplication(
                { id: applicationId },  // ← data là object
                {
                    onSuccess: () => {
                        refetchPending();
                        refetchRejected();
                        alert('Khôi phục đơn thành công');
                    },
                    onError: (error) => {
                        console.error('❌ Restore error:', error);
                        alert(error.response?.data?.message || 'Khôi phục đơn thất bại');
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

    // ✅ Tabs - chỉ 3 tab
    const tabs = [
        { id: 'pending', label: 'Pending Applications', count: pendingApps.length, icon: Clock, color: 'yellow' },
        { id: 'approved', label: 'Approved', count: approvedApps.length, icon: UserCheck, color: 'green' },
        { id: 'rejected', label: 'Rejected', count: rejectedApps.length, icon: UserX, color: 'red' },
    ];

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING': return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' };
            case 'APPROVED': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' };
            case 'REJECTED': return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
        }
    };

    return (
        <div className="space-y-6">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1.5 rounded-full w-max">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`px-5 py-2 text-sm font-bold rounded-full shadow-sm transition-all flex items-center gap-2 ${
                                isActive
                                    ? `bg-white text-gray-900`
                                    : `text-gray-500 hover:text-gray-900`
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? `text-${tab.color}-500` : ''}`} />
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isActive ? `bg-${tab.color}-100 text-${tab.color}-700` : 'bg-gray-200 text-gray-600'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {applications.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
                        <p className="text-gray-500">
                            {activeSubTab === 'pending' && 'Hiện không có đơn đăng ký nào đang chờ'}
                            {activeSubTab === 'approved' && 'Hiện chưa có thành viên nào được duyệt'}
                            {activeSubTab === 'rejected' && 'Hiện không có đơn bị từ chối'}
                        </p>
                    </div>
                ) : (
                    applications.map((app) => {
                        const statusConfig = getStatusConfig(app.status);
                        return (
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
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">
                                                    {app.volunteerId?.fullName || 'Unknown'}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    Applied {format(new Date(app.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                                </p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                {statusConfig.label}
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

                                        <p className="text-sm text-gray-600 italic line-clamp-2">
                                            "{app.motivation}"
                                        </p>

                                        {app.rejectReason && (
                                            <p className="text-xs text-red-500">
                                                Reason: {app.rejectReason}
                                            </p>
                                        )}

                                        <button
                                            onClick={() => setSelectedApp(selectedApp === app._id ? null : app._id)}
                                            className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            {selectedApp === app._id ? 'Hide Full Application' : 'View Full Application'}
                                            <span className={`material-symbols-outlined text-[16px] transition-transform ${selectedApp === app._id ? 'rotate-90' : ''}`}>
                                                arrow_forward
                                            </span>
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

                                    {/* Action Buttons */}
                                    {activeSubTab === 'pending' && (
                                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                            <button
                                                onClick={() => handleApprove(app._id)}
                                                className="flex-1 sm:flex-none py-2 px-6 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(app._id)}
                                                className="flex-1 sm:flex-none py-2 px-6 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {activeSubTab === 'rejected' && (
                                        <button
                                            onClick={() => handleRestore(app._id)}
                                            className="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Restore to Pending
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};