import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from '../validations/projectSchema';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useUpdateDraftProject } from '../hooks/useProjectMutations';
import { useToast } from '@/shared/contexts/ToastContext';
import { ArrowLeft, ArrowRight, Plus, Minus, Trash2 } from 'lucide-react';

const BudgetTracker = ({ control }) => {
  const milestones = useWatch({ control, name: "milestones" }) || [];
  const targetAmount = useWatch({ control, name: "targetAmount" }) || 0;

  const sumMilestones = milestones.reduce((sum, m) => sum + (Number(m.targetAmount) || 0), 0);
  const isBudgetMatch = sumMilestones === Number(targetAmount) && Number(targetAmount) > 0;

  const percentage = targetAmount > 0 ? Math.min(Math.round((sumMilestones / targetAmount) * 100), 100) : 0;

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm mt-6 transition-all duration-300">
      <div className="flex justify-between text-sm font-bold mb-3">
        <span className="text-slate-700">Allocation Tracker</span>
        <span className={`transition-colors duration-300 ${isBudgetMatch ? 'text-emerald-500' : 'text-primary'}`}>
          Allocated: {sumMilestones.toLocaleString()} / {Number(targetAmount || 0).toLocaleString()} VND
        </span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${isBudgetMatch ? 'bg-emerald-500' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function Step2Budget() {
  const { formData, updateFormData, nextStep, prevStep, projectId } = useProjectDraftStore();
  const { mutateAsync: updateDraft, isPending } = useUpdateDraftProject();
  const toast = useToast();

  const { register, control, handleSubmit, getValues, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      isFundraising: formData.isFundraising ?? true,
      targetAmount: formData.targetAmount || 0,
      milestones: formData.milestones?.length ? formData.milestones : [{ title: '', targetAmount: 0, description: '' }],
      needsVolunteers: formData.needsVolunteers || false,
      volunteerRoles: formData.volunteerRoles?.length ? formData.volunteerRoles : [],
    }
  });

  const { fields: msFields, append: msAppend, remove: msRemove } = useFieldArray({ control, name: "milestones" });
  const { fields: volFields, append: volAppend, remove: volRemove } = useFieldArray({ control, name: "volunteerRoles" });

  const isFundraising = useWatch({ control, name: "isFundraising" });
  const needsVolunteers = useWatch({ control, name: "needsVolunteers" });

  // Lifecycle Management
  useEffect(() => {
    if (isFundraising && msFields.length === 0) {
      msAppend({ title: '', targetAmount: 0, description: '' });
    } else if (!isFundraising && msFields.length > 0) {
      setValue('milestones', [], { shouldValidate: true });
      setValue('targetAmount', 0, { shouldValidate: true });
    }
  }, [isFundraising, msFields.length, msAppend, setValue]);

  useEffect(() => {
    if (!isFundraising) {
      setValue('needsVolunteers', true, { shouldValidate: true, shouldDirty: true });
    }
  }, [isFundraising, setValue]);

  useEffect(() => {
    if (needsVolunteers && volFields.length === 0) {
      volAppend({ title: '', quantity: 1 });
    } else if (!needsVolunteers && volFields.length > 0) {
      setValue('volunteerRoles', [], { shouldValidate: true });
    }
  }, [needsVolunteers, volFields.length, volAppend, setValue]);

  const onSubmit = async (data) => {
    if (!projectId) {
      toast.error('Critical Error: Project ID not found. Please return to Step 1.');
      return;
    }

    try {
      const payload = { ...data };
      updateFormData(payload);
      await updateDraft({ id: projectId, data: payload });
      nextStep();
    } catch (error) {
      console.error(" Submit Step 2 Failed:", error);
    }
  };

  const handleBack = () => {
    updateFormData(getValues());
    prevStep();
  };

  const handleQuantityChange = (index, delta) => {
    const currentValue = getValues(`volunteerRoles.${index}.quantity`) || 1;
    const newValue = Math.max(1, currentValue + delta);
    setValue(`volunteerRoles.${index}.quantity`, newValue, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-32 max-w-3xl mx-auto space-y-8">
      <fieldset disabled={isPending} className="group transition-opacity duration-300 disabled:opacity-60 disabled:cursor-not-allowed space-y-8">

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Are you raising funds for this project?</h2>
            <p className="text-sm text-slate-500 mt-1">Turn this off if you only want to look for volunteers.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input type="checkbox" className="sr-only peer" {...register('isFundraising')} />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
          </label>
        </div>

        {isFundraising && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Budget & Milestones</h2>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Total Target Amount (VND)</label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('targetAmount', { valueAsNumber: true })}
                    className={`w-full pl-4 pr-16 py-4 text-2xl font-bold rounded-xl border bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm
                      ${errors.targetAmount ? 'border-red-500 bg-red-50' : 'border-slate-200'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="100000000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="font-bold text-slate-500">VND</span>
                  </div>
                </div>
                {errors.targetAmount && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.targetAmount.message}</p>}
              </div>

              <BudgetTracker control={control} />
              {errors.milestones_sum && <p className="text-red-500 text-sm mt-2 font-bold">{errors.milestones_sum.message}</p>}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Milestone Builder</h3>

              <div className="space-y-4">
                {msFields.map((field, index) => (
                  <div key={field.id} className="border border-slate-200 rounded-2xl bg-white p-6 space-y-4 shadow-sm relative transition-all hover:border-slate-300">

                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-lg text-slate-900">Milestone {index + 1}</h4>
                      {msFields.length > 1 && (
                        <button type="button" onClick={() => msRemove(index)} className="text-slate-400 hover:text-red-500 transition-colors bg-white rounded-full p-1" title="Remove Milestone">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                          {...register(`milestones.${index}.title`)}
                          placeholder="e.g. Purchase Materials"
                          className={`w-full rounded-xl p-3 border bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm ${errors.milestones?.[index]?.title ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {errors.milestones?.[index]?.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.milestones[index].title.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Amount (VND)</label>
                        <input
                          type="number"
                          {...register(`milestones.${index}.targetAmount`, { valueAsNumber: true })}
                          placeholder="50000000"
                          className={`w-full rounded-xl p-3 border bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm ${errors.milestones?.[index]?.targetAmount ? 'border-red-500' : 'border-slate-200'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        />
                        {errors.milestones?.[index]?.targetAmount && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.milestones[index].targetAmount.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Purpose</label>
                      <textarea
                        {...register(`milestones.${index}.description`)}
                        placeholder="Describe what this milestone will achieve..."
                        className={`w-full rounded-xl p-3 border bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none h-24 ${errors.milestones?.[index]?.description ? 'border-red-500' : 'border-slate-200'}`}
                      />
                      {errors.milestones?.[index]?.description && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.milestones[index].description.message}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => msAppend({ title: '', targetAmount: 0, description: '' })}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-500 hover:text-primary hover:border-primary hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={20} /> Add Another Milestone
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Do you need volunteers for this project?</h2>
            <label className={`relative inline-flex items-center flex-shrink-0 ${!isFundraising ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                className="sr-only peer"
                disabled={!isFundraising}
                {...register('needsVolunteers')}
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            </label>
          </div>
          {errors.needsVolunteers && <p className="text-red-500 text-sm mt-2">{errors.needsVolunteers.message}</p>}

          {needsVolunteers && (
            <div className="space-y-4 pt-6 mt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
              {errors.volunteerRoles_sum && <p className="text-red-500 text-sm font-bold mb-4">{errors.volunteerRoles_sum.message}</p>}

              {volFields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm relative transition-all hover:border-slate-300">

                  {volFields.length > 1 && (
                    <button type="button" onClick={() => volRemove(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white rounded-full p-1 transition-colors" title="Remove Role">
                      <Trash2 size={20} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Role Title</label>
                      <input
                        {...register(`volunteerRoles.${index}.title`)}
                        className={`w-full rounded-xl p-3 border bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm 
                            ${errors.volunteerRoles?.[index]?.title ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="e.g. Tree Planter"
                      />
                      {errors.volunteerRoles?.[index]?.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.volunteerRoles[index].title.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Number of Volunteers Needed</label>
                      <div className={`flex items-center border rounded-xl bg-slate-50 overflow-hidden shadow-sm h-[48px] transition-all
                          ${errors.volunteerRoles?.[index]?.quantity ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary'}`}>

                        <div className="flex h-full border-r border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, -1)}
                            className="w-12 hover:bg-slate-200 text-slate-600 transition-colors h-full flex items-center justify-center outline-none"
                          >
                            <Minus size={18} />
                          </button>
                        </div>

                        <input
                          type="number"
                          {...register(`volunteerRoles.${index}.quantity`, { valueAsNumber: true })}
                          className="w-full text-center border-none bg-transparent focus:ring-0 font-bold p-0 text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <div className="flex h-full border-l border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, 1)}
                            className="w-12 hover:bg-slate-200 text-slate-600 transition-colors h-full flex items-center justify-center outline-none"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      {errors.volunteerRoles?.[index]?.quantity && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.volunteerRoles[index].quantity.message}</p>}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => volAppend({ title: '', quantity: 1 })}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-500 hover:text-primary hover:border-primary hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={20} /> Add Another Volunteer Role
              </button>
            </div>
          )}
        </div>

      </fieldset>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <ArrowLeft size={20} /> Back to Story
          </button>

          <button
            type="submit"
            disabled={isPending}
            className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-sm
              ${isPending ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-yellow-500/20'}`}
          >
            {isPending ? 'Saving...' : 'Next: Preview & Submit'}
            {!isPending && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </form>
  );
}