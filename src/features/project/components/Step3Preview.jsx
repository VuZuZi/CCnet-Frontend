import { useTranslation } from 'react-i18next';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useSubmitProject } from '../hooks/useProjectMutations';
import { useToast } from '@/shared/contexts/ToastContext';
import { 
    CheckCircle2, 
    Circle, 
    Info, 
    Lock, 
    ArrowLeft, 
    Eye, 
    Users, 
    Flag, 
    BadgeCheck,
    Loader2
} from 'lucide-react';

export default function Step3Preview() {
  const { t } = useTranslation();
  const { formData, prevStep, projectId } = useProjectDraftStore();
  const { mutate: submitProject, isPending } = useSubmitProject();
  const toast = useToast();

  const handleFinalSubmit = () => {
    if (!projectId) {
      toast.error(t('project.error_project_id_missing'));
      return;
    }
    submitProject(projectId);
  };

  const getCoverImageSrc = () => {
    if (!formData.coverMedia || formData.coverMedia.length === 0) return null;
    const media = formData.coverMedia[0]?.file || formData.coverMedia[0];
    if (typeof media === 'string') return media; 
    if (media && typeof media.url === 'string') return media.url; 
    if (media instanceof File || media instanceof Blob) {
        return URL.createObjectURL(media); 
    }
    return null;
  };

  const coverSrc = getCoverImageSrc();

  const isStoryComplete = !!formData.title && !!formData.category && !!formData.location;
  const isEvidenceUploaded = formData.documents && formData.documents.length > 0;
  const isBudgetSet = formData.isFundraising ? (formData.targetAmount > 0 && formData.milestones?.length > 0) : true;
  const isVolunteersAdded = formData.needsVolunteers ? formData.volunteerRoles?.length > 0 : true;

  const totalVolunteers = formData.volunteerRoles?.reduce((sum, role) => sum + (Number(role.quantity) || 0), 0) || 0;
  const milestonesCount = formData.milestones?.length || 0;

  const StatusPill = ({ isComplete, label }) => (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors
        ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
          {isComplete ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
              <Circle size={18} className="text-slate-400" />
          )}
          <span className={`text-sm font-bold ${isComplete ? 'text-emerald-800' : 'text-slate-500'}`}>
              {label}
          </span>
      </div>
  );

  return (
    <form className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Info className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-2">{t('project.review_project_title')}</h3>
          <p className="text-blue-800/80 leading-relaxed text-sm">
            {t('project.review_project_desc')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
         <StatusPill isComplete={isStoryComplete} label={t('project.story_completed')} />
         <StatusPill isComplete={isEvidenceUploaded} label={t('project.evidence_uploaded')} />
         <StatusPill isComplete={isBudgetSet} label={t('project.budget_milestones_set')} />
         <StatusPill isComplete={isVolunteersAdded} label={t('project.volunteer_roles_added')} />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center sm:text-left">{t('project.live_preview')}</h2>
        
        <div className="max-w-md mx-auto border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-lg relative group transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20 shadow-lg flex items-center gap-1.5">
                <Eye size={14} /> {t('project.preview_only')}
            </div>

            <div className="relative h-56 w-full bg-slate-800">
                <img 
                    src={coverSrc || 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80'} 
                    alt="Cover" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md mb-2.5 inline-block shadow-sm">
                        {formData.category ? t(`project.categories.${formData.category}`) : t('project.category_placeholder')}
                    </span>
                    <h3 className="text-white font-bold text-xl leading-tight line-clamp-2">
                        {formData.title || t('project.title_placeholder')}
                    </h3>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200 flex-shrink-0">
                        <span className="font-bold text-emerald-700">{t('common.you')}</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">{t('project.organized_by')}</p>
                        <p className="font-bold text-sm text-slate-900">{t('project.your_organization')}</p>
                    </div>
                    <div className="ml-auto">
                        <BadgeCheck className="text-blue-500" size={20} title={t('project.verified_organizer')} />
                    </div>
                </div>

                {formData.isFundraising ? (
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-2xl font-black text-slate-900">
                                    0 <span className="text-sm font-bold text-slate-500">VND</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {t('project.raised_of', { amount: Number(formData.targetAmount || 0).toLocaleString() })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">0%</p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all w-0"></div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-emerald-700 font-bold">{t('project.volunteer_only_project')}</p>
                        <p className="text-xs text-emerald-600 mt-1">{t('project.not_raising_funds')}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <Users className="text-slate-400 mx-auto mb-1.5" size={20} />
                        <p className="text-xs text-slate-500">{t('project.volunteers')}</p>
                        <p className="font-bold text-slate-900">{t('project.volunteers_needed', { count: totalVolunteers })}</p>
                    </div>
                    {formData.isFundraising && (
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                            <Flag className="text-slate-400 mx-auto mb-1.5" size={20} />
                            <p className="text-xs text-slate-500">{t('project.milestones_title')}</p>
                            <p className="font-bold text-slate-900">{t('project.milestones_set', { count: milestonesCount })}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="text-center mt-6">
            <button type="button" className="inline-flex items-center justify-center gap-2 text-primary hover:text-primary-hover font-bold transition-colors outline-none">
                {t('project.view_full_preview')}
            </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <button 
            type="button" 
            onClick={prevStep} 
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <ArrowLeft size={20} /> {t('project.back_to_budget')}
          </button>
          
          <button 
            type="button" 
            onClick={handleFinalSubmit} 
            disabled={isPending || (!isStoryComplete || !isEvidenceUploaded || !isBudgetSet || !isVolunteersAdded)}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 font-bold rounded-2xl transition-all shadow-sm text-lg
              ${isPending || (!isStoryComplete || !isEvidenceUploaded || !isBudgetSet || !isVolunteersAdded)
                ? 'bg-slate-300 text-white cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover text-white shadow-xl shadow-yellow-500/30 border-2 border-transparent focus:ring-4 focus:ring-primary/20'}`}
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Lock size={24} />
            )}
            {isPending ? t('project.submitting') : t('project.submit_for_approval')}
          </button>
        </div>
      </div>
    </form>
  );
}