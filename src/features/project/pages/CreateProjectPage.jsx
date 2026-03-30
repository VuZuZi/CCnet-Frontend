import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { LanguageSwitcher } from '@/i18n/components/LanguageSwitcher';
import Step1Story from '../components/Step1Story';
import Step2Budget from '../components/Step2Budget';
import Step3Preview from '../components/Step3Preview';

export function CreateProjectPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id || location.pathname.includes('edit');

    const STEPS = [
        { id: 1, title: t('project.step_story') },
        { id: 2, title: t('project.step_budget') },
        { id: 3, title: t('project.step_preview') }
    ];

    const { currentStep, updateFormData, setProjectId, resetDraft, projectId } = useProjectDraftStore();
    const [isHydrated, setIsHydrated] = useState(!isEditMode);

    const { data: draftData, isLoading, isError } = useProjectDetail(id);

    useEffect(() => {
        if (!isEditMode) {
            if (projectId) resetDraft();
            return;
        }

        if (draftData) {
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
    }, [draftData, id, isEditMode, projectId, resetDraft, setProjectId, updateFormData]);

    if (isEditMode && isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 animate-pulse">{t('project.syncing_draft')}</div>;
    }

    if (isEditMode && isError) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">{t('project.error_draft')}</div>;
    }

    if (!isHydrated) return null;

    return (
        <div className="bg-[#f3f4f6] py-8 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header: Centered Stepper + Status Bar */}
                <div className="flex flex-col items-center mb-20">
                    <div className="w-full flex items-center justify-between mb-10">
                        <LanguageSwitcher />
                        <div className="hidden lg:flex items-center text-sm text-slate-500 gap-1.5 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            {t('project.draft_saved')}
                        </div>
                    </div>

                    <div className="w-full max-w-2xl px-4">
                        <div className="flex items-center relative">
                            {STEPS.map((step, index) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                const isLast = index === STEPS.length - 1;

                                return (
                                    <div key={step.id} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1 relative z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 border-2
                                            ${isActive ? 'bg-[#fbbf24] text-white border-[#fbbf24]' :
                                                    isCompleted ? 'bg-[#fbbf24] text-white border-[#fbbf24]' :
                                                        'bg-white text-slate-400 border-slate-200'}`}
                                            >
                                                {isCompleted ? '✓' : step.id}
                                            </div>
                                            <span className={`text-xs md:text-sm mt-3 absolute top-10 whitespace-nowrap transition-colors
                                            ${isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {!isLast && (
                                            <div className={`h-1 flex-1 -mx-2 rounded-full z-0 transition-colors duration-300
                                            ${isCompleted ? 'bg-[#fbbf24]' : 'bg-slate-200'}`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="mt-8">
                    {currentStep === 1 && <Step1Story />}
                    {currentStep === 2 && <Step2Budget />}
                    {currentStep === 3 && <Step3Preview />}
                </div>
            </div>
        </div>
    );
}
