// src/features/volunteer/pages/ApplyPage.jsx
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VolunteerApplication from '../components/VolunteerApplication';
import { useVolunteerApplication } from '../hooks/useVolunteerApplication';

const ApplyPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy id từ URL: /volunteer/:id/apply

    // Lấy data từ state hoặc từ params
    const { project, user, projectName, projectId, opportunityId } = location.state || {};

    const { submitApplication, isSubmitting } = useVolunteerApplication();

    const handleSubmit = async (formData) => {
        try {
            await submitApplication({
                ...formData,
                projectId: projectId || id,
                opportunityId: opportunityId || id,
            });
            alert('Đăng ký thành công!');
            navigate(`/projects/${projectId || id}`);
        } catch (error) {
            console.error('Submit failed:', error);
            alert('Đăng ký thất bại. Vui lòng thử lại!');
        }
    };

    const handleBack = () => {
        navigate(-1); // Quay lại trang trước
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Project
                </button>

                {/* Application Form */}
                <VolunteerApplication
                    project={project || { _id: id, title: projectName || 'Volunteer Opportunity' }}
                    user={user}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};

export default ApplyPage;