import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import Step1Story from '../components/Step1Story';
import Step2Budget from '../components/Step2Budget';
import Step3Preview from '../components/Step3Preview';

const STEPS = [
    { id: 1, title: 'Story & Evidence' },
    { id: 2, title: 'Budget & Volunteers' },
    { id: 3, title: 'Preview & Submit' }
];

export function CreateProjectPage() {
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id || location.pathname.includes('edit');

    const { currentStep, updateFormData, setProjectId, resetDraft, projectId } = useProjectDraftStore();
    const [isHydrated, setIsHydrated] = useState(!isEditMode);

    const { data: draftData, isLoading, isError } = useProjectDetail(id);

    useEffect(() => {
        if (!isEditMode) {
            if (projectId) resetDraft();
            setIsHydrated(true);
            return;
        }

        if (isEditMode && draftData) {
            const parseDateLocal = (isoString) => {
                if (!isoString) return '';
                return format(new Date(isoString), 'yyyy-MM-dd');
            };

            const normalizedData = {
                title: draftData.title || '',
                category: draftData.category || '',
                location: draftData.location || null,
                description: draftData.description || '',
                isFundraising: draftData.targetAmount > 0,
                targetAmount: draftData.targetAmount || 0,
                startDate: parseDateLocal(draftData.startDate),
                endDate: parseDateLocal(draftData.endDate),
                needsVolunteers: draftData.needsVolunteers || false,
                milestones: draftData.milestones?.length ? draftData.milestones : [],
                volunteerRoles: draftData.volunteerRoles || [],
                coverMedia: draftData.coverMedia ? [draftData.coverMedia] : [],
                documents: draftData.documents || [],
                deletedDocumentIds: []
            };

            updateFormData(normalizedData);
            setProjectId(id);
            setIsHydrated(true);
        }
    }, [isEditMode, draftData]);

    if (isEditMode && isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 animate-pulse">Đang đồng bộ dữ liệu bản nháp từ máy chủ...</div>;
    }

    if (isEditMode && isError) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Lỗi: Không tìm thấy bản nháp hoặc bạn không có quyền truy cập.</div>;
    }

    if (!isHydrated) return null;

    return (
        <div className="bg-[#f3f4f6] py-8 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center w-full max-w-2xl relative">
                        {STEPS.map((step, index) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            const isLast = index === STEPS.length - 1;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300
                                            ${isActive ? 'bg-[#fbbf24] text-white' :
                                                isCompleted ? 'bg-[#fbbf24] text-white' :
                                                    'bg-slate-200 text-slate-500'}`}
                                        >
                                            {isCompleted ? '✓' : step.id}
                                        </div>
                                        <span className={`text-sm mt-2 absolute top-8 whitespace-nowrap transition-colors
                                            ${isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {!isLast && (
                                        <div className={`h-1 flex-1 -mx-4 rounded-full z-0 transition-colors duration-300
                                            ${isCompleted ? 'bg-[#fbbf24]' : 'bg-slate-200'}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden md:flex items-center text-sm text-slate-500 gap-1.5 ml-8 mt-2">
                        <CheckCircle2 size={18} className="text-slate-400" />
                        Draft saved just now
                    </div>
                </div>

                <div className="mt-12 pb-32">
                    {currentStep === 1 && <Step1Story />}
                    {currentStep === 2 && <Step2Budget />}
                    {currentStep === 3 && <Step3Preview />}
                </div>
            </div>
        </div>
    );
}