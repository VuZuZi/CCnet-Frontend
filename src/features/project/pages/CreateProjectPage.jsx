import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { useHelpRequestAsProjectData } from '@/features/needHelp/hooks/useHelpRequestQueries';
import { format } from 'date-fns';
import { CheckCircle2, Trash2, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';
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
    const navigate = useNavigate();
    const toast = useToast();
    const isEditMode = !!id || location.pathname.includes('edit');

    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const helpRequestId = queryParams.get('helpRequestId');
    const { currentStep, updateFormData, setProjectId, resetDraft, projectId } = useProjectDraftStore();

    const { data: draftData, isLoading, isError } = useProjectDetail(id);
    const { data: helpRequestData, isLoading: isHelpRequestLoading, isError: isHelpRequestError } = useHelpRequestAsProjectData(helpRequestId);

    useEffect(() => {
        if (!isEditMode && !helpRequestId) {
            return;
        }

        if (isEditMode && draftData) {
            const parseDateLocal = (isoString) => {
                if (!isoString) return '';
                return format(new Date(isoString), 'yyyy-MM-dd');
            };

            const normalizeCoverMedia = () => {
                if (!draftData.coverMedia) return [];
                return Array.isArray(draftData.coverMedia)
                    ? draftData.coverMedia
                    : [draftData.coverMedia];
            };

            const normalizedData = {
                projectType: draftData.projectType || 'FUNDED',
                title: draftData.title || '',
                category: draftData.category || '',
                location: draftData.location || null,
                description: draftData.description || '',
                beneficiaryInfo: draftData.beneficiaryInfo || { details: '' },
                targetAmount: draftData.targetAmount || 0,
                mvpAmount: draftData.mvpAmount || 0,
                budgetBreakdown: draftData.budgetBreakdown || [],
                surplusPolicy: draftData.surplusPolicy || '',
                startDate: parseDateLocal(draftData.startDate),
                endDate: parseDateLocal(draftData.endDate),
                needsVolunteers: draftData.needsVolunteers || false,
                milestones: draftData.milestones?.length ? draftData.milestones : [],
                volunteerRoles: draftData.volunteerRoles || [],
                coverMedia: normalizeCoverMedia(),
                documents: draftData.documents || [],
                deletedDocumentIds: [],
                fromHelpRequestId: draftData.fromHelpRequestId || null,
            };

            resetDraft();
            updateFormData(normalizedData);
            setProjectId(id);
        }
        
        if (helpRequestId && helpRequestData) {
            if (projectId) resetDraft();

            const normalizedData = {
                title: helpRequestData.title || '',
                category: helpRequestData.category || '',
                location: helpRequestData.location || null,
                description: helpRequestData.description || '',
                isFundraising: helpRequestData.isFundraising,
                targetAmount: helpRequestData.targetAmount || 0,
                startDate: '',
                endDate: '',
                needsVolunteers: false,
                milestones: [],
                volunteerRoles: [],
                coverMedia: helpRequestData.coverMedia || [],
                documents: helpRequestData.documents || [],
                deletedDocumentIds: [],
                fromHelpRequestId: helpRequestId
            };

            updateFormData(normalizedData);
        }
    }, [isEditMode, draftData, helpRequestId, helpRequestData, id, projectId, resetDraft, setProjectId, updateFormData]);

    const handleDiscardDraft = () => {
        resetDraft();
        setIsDiscardModalOpen(false);
        toast.success('Đã hủy bản nháp thành công');
        navigate('/projects');
    };

    const isPageReady = !isEditMode && !helpRequestId
        ? true
        : Boolean((isEditMode && draftData) || (helpRequestId && helpRequestData));

    if ((isEditMode && isLoading) || (helpRequestId && isHelpRequestLoading)) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 animate-pulse">Đang đồng bộ dữ liệu từ máy chủ...</div>;
    }

    if ((isEditMode && isError) || (helpRequestId && isHelpRequestError)) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Lỗi: Không tìm thấy dữ liệu hoặc bạn không có quyền truy cập.</div>;
    }

    if (!isPageReady) return null;

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
                        
                        <span className="mx-2 text-slate-300">|</span>
                        <button 
                            onClick={() => setIsDiscardModalOpen(true)}
                            className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                            <Trash2 size={14} />
                            Hủy bản nháp
                        </button>
                    </div>
                </div>

                <div className="mt-12 pb-32">
                    {currentStep === 1 && <Step1Story />}
                    {currentStep === 2 && <Step2Budget />}
                    {currentStep === 3 && <Step3Preview />}
                </div>

                {isDiscardModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mb-4">
                                <AlertTriangle className="text-red-500" size={24} />
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Hủy bản nháp dự án?</h3>
                            <p className="text-slate-600 mb-6">
                                Hành động này sẽ xóa toàn bộ thông tin bạn đã nhập và không thể hoàn tác. Bạn có chắc chắn muốn bắt đầu lại từ đầu không?
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDiscardModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Tiếp tục soạn thảo
                                </button>
                                <button
                                    onClick={handleDiscardDraft}
                                    className="flex-1 px-4 py-2.5 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Xác nhận Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}