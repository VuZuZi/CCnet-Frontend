import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDraftStep2Schema } from '../validations/projectSchema';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useUpdateDraftProject } from '../hooks/useProjectMutations';
import { useToast } from '@/shared/contexts/ToastContext';
import { ArrowLeft, ArrowRight, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { devConfig } from '@/config/app.config';

const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0]; 
};

export default function Step2Budget() {
  const { formData, updateFormData, nextStep, prevStep, projectId } = useProjectDraftStore();
  const { mutateAsync: updateDraft, isPending } = useUpdateDraftProject();
  const toast = useToast();

  const isFunded = formData.projectType === 'FUNDED';
  const schema = createDraftStep2Schema(formData.startDate, formData.endDate);

  const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      targetAmount: formData.targetAmount || 0,
      mvpAmount: formData.mvpAmount || 0,
      surplusPolicy: formData.surplusPolicy || '',
      budgetBreakdown: formData.budgetBreakdown?.length ? formData.budgetBreakdown : [],
      milestones: formData.milestones?.length 
        ? formData.milestones.map(m => ({ 
            ...m, 
            endDate: formatDateForInput(m.endDate) 
          })) 
        : [],
      needsVolunteers: isFunded ? (formData.needsVolunteers || false) : true,
      volunteerRoles: formData.volunteerRoles?.length ? formData.volunteerRoles : [],
    }
  });

  const { fields: bbFields, append: bbAppend, remove: bbRemove } = useFieldArray({ control, name: "budgetBreakdown" });
  const { fields: msFields, append: msAppend, remove: msRemove } = useFieldArray({ control, name: "milestones" });
  const { fields: volFields, append: volAppend, remove: volRemove } = useFieldArray({ control, name: "volunteerRoles" });

  const needsVolunteers = useWatch({ control, name: "needsVolunteers" });

  useEffect(() => {
    if (!isFunded) {
      setValue('needsVolunteers', true);
    }
  }, [isFunded, setValue]);

  useEffect(() => {
    if (!needsVolunteers) {
       setValue('volunteerRoles', []);
    }
  }, [needsVolunteers, setValue]);

  const executeSave = async (data, goNext = false) => {
    if (!projectId) {
      toast.error('Lỗi nghiêm trọng: Không tìm thấy ID dự án. Vui lòng quay lại Bước 1.');
      return;
    }

    try {
      const step2Payload = isFunded ? data : {
        ...data,
        targetAmount: 0,
        mvpAmount: 0,
        surplusPolicy: '',
        budgetBreakdown: [],
        milestones: data.milestones.map(m => ({ ...m, targetAmount: 0 }))
      };

      updateFormData(step2Payload);

      const fullFormData = useProjectDraftStore.getState().formData;

      await updateDraft({ 
        id: projectId, 
        data: fullFormData 
      });

      if (goNext) {
        nextStep();
      } else {
        toast.success('Đã lưu bản nháp an toàn!');
      }
    } catch (error) {
      devConfig.error("[CTO Log] Save Step 2 Failed:", error);
    }
  };

  const onInvalid = (validationErrors) => {
    devConfig.error("[CTO Log] Form Validation Failed:", validationErrors);
    toast.error("Có lỗi ở các trường nhập liệu. Vui lòng kéo lên và kiểm tra các ô màu đỏ.");
  };

  const handleNextStep = handleSubmit((data) => executeSave(data, true), onInvalid);

  return (
    <form className="pb-32 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <fieldset disabled={isPending} className="space-y-8 disabled:opacity-60 disabled:cursor-not-allowed">

        {isFunded && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Kế Hoạch Tài Chính & Giải Ngân</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tổng mục tiêu gọi vốn (VND)</label>
                <input type="number" {...register('targetAmount')} className="w-full rounded-xl p-3 border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-primary outline-none" />
                {errors.targetAmount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.targetAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ngưỡng giải ngân tối thiểu MVP (VND)</label>
                <input type="number" {...register('mvpAmount')} className={`w-full rounded-xl p-3 border ${errors.mvpAmount ? 'border-red-500' : 'border-slate-200'} bg-slate-50 text-slate-900 outline-none`} />
                {errors.mvpAmount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mvpAmount.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Chính sách xử lý tiền thừa (Surplus Policy)</label>
              <select {...register('surplusPolicy')} className="w-full rounded-xl p-3 border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary">
                <option value="">-- Chọn chính sách --</option>
                <option value="REFUND_PRO_RATA">Hoàn tiền theo tỷ lệ đóng góp (Pro-rata Refund)</option>
                <option value="CARRY_OVER">Chuyển sang dự án khác của tổ chức (Carry Over)</option>
                <option value="DONATE_TO_PLATFORM">Quyên góp cho Quỹ dự phòng nền tảng</option>
              </select>
              {errors.surplusPolicy && <p className="text-red-500 text-xs mt-1 font-medium">{errors.surplusPolicy.message}</p>}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Bảng dự toán chi phí (Budget Breakdown)</h3>
                <button type="button" onClick={() => bbAppend({ item: '', amount: 0, note: '' })} className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1"><Plus size={16} /> Thêm khoản chi</button>
              </div>
              <div className="space-y-3">
                {bbFields.map((field, idx) => (
                  <div key={field.id} className="flex flex-col gap-1">
                    <div className="flex gap-3 items-start">
                      <input {...register(`budgetBreakdown.${idx}.item`)} placeholder="Tên vật tư/khoản chi" className={`flex-1 rounded-lg p-2 border ${errors.budgetBreakdown?.[idx]?.item ? 'border-red-500' : 'border-slate-200'} bg-slate-50 text-sm outline-none`} />
                      <input type="number" {...register(`budgetBreakdown.${idx}.amount`)} placeholder="Số tiền (VND)" className={`w-32 rounded-lg p-2 border ${errors.budgetBreakdown?.[idx]?.amount ? 'border-red-500' : 'border-slate-200'} bg-slate-50 text-sm outline-none`} />
                      <input {...register(`budgetBreakdown.${idx}.note`)} placeholder="Ghi chú (Tùy chọn)" className="flex-1 rounded-lg p-2 border border-slate-200 bg-slate-50 text-sm outline-none hidden md:block" />
                      <button type="button" onClick={() => bbRemove(idx)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                    {(errors.budgetBreakdown?.[idx]?.item || errors.budgetBreakdown?.[idx]?.amount) && (
                      <div className="flex gap-3 text-red-500 text-xs">
                        <span className="flex-1">{errors.budgetBreakdown[idx]?.item?.message}</span>
                        <span className="w-32">{errors.budgetBreakdown[idx]?.amount?.message}</span>
                        <span className="flex-1 hidden md:block"></span>
                        <span className="w-9"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.budgetBreakdown?.message && <p className="text-red-500 text-xs mt-2 font-medium">{errors.budgetBreakdown.message}</p>}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Tiến Độ Thực Thi (Milestones)</h2>
            <button type="button" onClick={() => msAppend({ title: '', description: '', targetAmount: 0, endDate: '', deliverables: '' })} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg text-sm hover:bg-primary/20 transition-colors flex items-center gap-1">
              <Plus size={16} /> Thêm Mốc
            </button>
          </div>

          {errors.milestones_sum && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold text-sm">
              ⚠️ {errors.milestones_sum.message}
            </div>
          )}

          <div className="space-y-6">
            {msFields.map((field, idx) => (
              <div key={field.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 relative group">
                <button type="button" onClick={() => msRemove(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Tên giai đoạn</label>
                    <input {...register(`milestones.${idx}.title`)} className={`w-full rounded-lg p-2 mt-1 border ${errors.milestones?.[idx]?.title ? 'border-red-500' : 'border-slate-200'} outline-none`} placeholder="VD: Đổ móng cầu" />
                    {errors.milestones?.[idx]?.title && <p className="text-red-500 text-xs mt-1">{errors.milestones[idx].title.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Hạn chót hoàn thành</label>
                    <input type="date" {...register(`milestones.${idx}.endDate`)} className={`w-full rounded-lg p-2 mt-1 border ${errors.milestones?.[idx]?.endDate ? 'border-red-500' : 'border-slate-200'} outline-none`} />
                    {errors.milestones?.[idx]?.endDate && <p className="text-red-500 text-xs mt-1">{errors.milestones[idx].endDate.message}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Mô tả công việc</label>
                    <textarea {...register(`milestones.${idx}.description`)} className={`w-full rounded-lg p-2 mt-1 border ${errors.milestones?.[idx]?.description ? 'border-red-500' : 'border-slate-200'} outline-none min-h-[60px] resize-y`} placeholder="VD: Khảo sát địa hình, chuẩn bị vật tư, huy động nhân lực..." />
                    {errors.milestones?.[idx]?.description && <p className="text-red-500 text-xs mt-1">{errors.milestones[idx].description.message}</p>}
                  </div>

                  {isFunded && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500">Ngân sách cho mốc này (VND)</label>
                      <input type="number" {...register(`milestones.${idx}.targetAmount`)} className={`w-full rounded-lg p-2 mt-1 border ${errors.milestones?.[idx]?.targetAmount ? 'border-red-500' : 'border-slate-200'} outline-none`} placeholder="VD: 50000000" />
                      {errors.milestones?.[idx]?.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.milestones[idx].targetAmount.message}</p>}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Kết quả bàn giao (Deliverables)</label>
                    <input {...register(`milestones.${idx}.deliverables`)} className={`w-full rounded-lg p-2 mt-1 border ${errors.milestones?.[idx]?.deliverables ? 'border-red-500' : 'border-slate-200'} outline-none`} placeholder="VD: Có biên bản nghiệm thu móng" />
                    {errors.milestones?.[idx]?.deliverables && <p className="text-red-500 text-xs mt-1">{errors.milestones[idx].deliverables.message}</p>}
                  </div>
                </div>
              </div>
            ))}
            {errors.milestones?.message && !errors.milestones_sum && <p className="text-red-500 text-xs mt-2 font-medium">{errors.milestones.message}</p>}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Tuyển Tình Nguyện Viên</h2>
            <label className={`relative inline-flex items-center ${!isFunded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input type="checkbox" className="sr-only peer" disabled={!isFunded} {...register('needsVolunteers')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {needsVolunteers && (
            <div className="space-y-4">
              {volFields.map((field, idx) => (
                <div key={field.id} className="p-5 border border-slate-200 rounded-2xl relative">
                  <button type="button" onClick={() => volRemove(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <div>
                      <label className="text-xs font-bold text-slate-500">Vai trò</label>
                      <input {...register(`volunteerRoles.${idx}.title`)} placeholder="VD: Thợ xây" className="w-full p-2 border border-slate-200 rounded-lg mt-1 outline-none" />
                      {errors.volunteerRoles?.[idx]?.title && <p className="text-red-500 text-xs mt-1">{errors.volunteerRoles[idx].title.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">Số lượng cần</label>
                      <input type="number" {...register(`volunteerRoles.${idx}.quantity`)} className="w-full p-2 border border-slate-200 rounded-lg mt-1 outline-none" />
                      {errors.volunteerRoles?.[idx]?.quantity && <p className="text-red-500 text-xs mt-1">{errors.volunteerRoles[idx].quantity.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">Kỹ năng yêu cầu</label>
                      <input {...register(`volunteerRoles.${idx}.skills`)} placeholder="VD: Biết trộn hồ" className="w-full p-2 border border-slate-200 rounded-lg mt-1 outline-none" />
                      {errors.volunteerRoles?.[idx]?.skills && <p className="text-red-500 text-xs mt-1">{errors.volunteerRoles[idx].skills.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">Địa điểm & Thời gian</label>
                      <input {...register(`volunteerRoles.${idx}.location`)} placeholder="VD: Bản Pa Tần, 20/05" className="w-full p-2 border border-slate-200 rounded-lg mt-1 outline-none" />
                      {errors.volunteerRoles?.[idx]?.location && <p className="text-red-500 text-xs mt-1">{errors.volunteerRoles[idx].location.message}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => volAppend({ title: '', quantity: 1, skills: '', location: '' })} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl font-bold text-slate-500 hover:text-primary hover:border-primary transition-colors flex justify-center items-center gap-2">
                <Plus size={18} /> Thêm vị trí tình nguyện
              </button>
            </div>
          )}
        </div>

      </fieldset>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <button type="button" onClick={prevStep} disabled={isPending} className="flex items-center gap-2 px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => {
                const currentData = getValues();
                executeSave(currentData, false);
              }} 
              disabled={isPending} 
              className="hidden md:flex items-center gap-2 px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm disabled:opacity-50"
            >
              <Save size={18} /> Lưu Nháp
            </button>
            
            <button 
              type="button" 
              onClick={handleNextStep} 
              disabled={isPending} 
              className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl shadow-sm ${isPending ? 'bg-slate-400 text-white' : 'bg-primary text-white hover:bg-primary-hover shadow-yellow-500/20'}`}
            >
              {isPending && <Loader2 className="animate-spin" size={18} />}
              {isPending ? 'Đang xử lý...' : 'Bước cuối: Xem trước'}
              {!isPending && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}