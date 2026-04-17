import { Controller } from "react-hook-form";
import { TipTapEditor } from "@/shared/components/ui/TipTapEditor";

export function Step1StorySection({ register, control, errors }) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">
        Story & Beneficiaries
      </h2>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Beneficiary Description
        </label>

        <textarea
          {...register("beneficiaryInfo.details")}
          className={`min-h-[100px] w-full resize-y rounded-xl border bg-slate-50 p-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all ${
            errors.beneficiaryInfo?.details
              ? "border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary"
          }`}
          placeholder="Who will receive help from this project? Approximate number of people?"
        />

        {errors.beneficiaryInfo?.details ? (
          <p className="mt-1.5 text-sm font-medium text-red-500">
            {errors.beneficiaryInfo.details.message}
          </p>
        ) : null}
      </div>

      <div className="pt-2">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Detailed Story
        </label>

        <div className={errors.description ? "rounded-xl ring-2 ring-red-200" : ""}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TipTapEditor value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {errors.description ? (
          <p className="mt-1.5 text-sm font-medium text-red-500">
            {errors.description.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default Step1StorySection;